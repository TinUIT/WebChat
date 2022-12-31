from django.shortcuts import redirect, render, get_object_or_404
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from webchatapp import settings
from django.core.mail import EmailMessage, send_mail
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes,force_str
from . tokens import generate_token
from .models import Profile, Relationship
from django.contrib.auth.decorators import login_required
from django.views.generic import ListView
from django.db.models import Q

@login_required(login_url="/authentication")
def home(request):
    return render(request, 'home.html', {'user_name':request.user})

@login_required(login_url="/authentication")
def videochat(request):
    return render(request, 'videochat.html', {'user_name':request.user})

@login_required(login_url="/authentication")
def changepassword(request):
    return render(request, 'changepassword.html')

@login_required(login_url="/")
def chat(request):
    if request.method == "POST":
        data = request.POST.get('receiver')
        user = request.user
        sender = Profile.objects.get(user=user)
        receiver = Profile.objects.get(user=data)

        rel = Relationship.objects.create(sender=sender, receiver=receiver, status='send')
        
    data = Profile.objects.get(user__id=request.user.id) 
    return render(request, 'chat.html', {'user_name':request.user, "data": data})

@login_required(login_url="/")
def profile(request):
    context={}
    ch = Profile.objects.filter(user__id=request.user.id)
    if len(ch)>0:
        data = Profile.objects.get(user__id=request.user.id)
        context["data"] = data
    # else:
    #     return redirect('home')
    if request.method == "POST":
        rname = request.POST.get('name')
        genderr = request.POST.get('gender')
        bd =request.POST.get('birthday')
        ct =request.POST.get('item')
        data.name= rname
        data.gender=genderr
        data.birthday=bd
        data.city=ct
        data.save()
    return render(request, "profile.html",context)

def authentication(request):
    return render(request, "authentication/index.html")

def signup(request):
    
    if request.method == "POST":
        username = request.POST.get('edit_username')
        fname = request.POST.get('edit_firstname')
        lname = request.POST.get('edit_lastname')
        email = request.POST.get('edit_email')
        pass1 = request.POST.get('edit_password')
        pass2 = request.POST.get('edit_re_enter_password')
        if User.objects.filter(username=username):
            messages.error(request, "Username already exist! Please try some other username.")
            return redirect('signup')
        
        if User.objects.filter(email=email).exists():
            messages.error(request, "Email Already Registered!!")
            return redirect('signup')
        
        if len(username)>20:
            messages.error(request, "Username must be under 20 charcters!!")
            return redirect('signup')
        
        if pass1 != pass2:
            messages.error(request, "Passwords didn't matched!!")
            return redirect('signup')
        
        if not username.isalnum():
            messages.error(request, "Username must be Alpha-Numeric!!")
            return redirect('signup')
        
        myuser = User.objects.create_user(username = username, email = email, password = pass1)
        myuser.first_name = fname
        myuser.last_name = lname
        myuser.is_active = False
        myuser.save()
        messages.success(request, "Your Account has been created succesfully!! Please check your email to confirm your email address in order to activate your account.")
        subject = "Welcome !!"
        message = "Hello " + myuser.first_name + "!! \n" + "Welcome !! \nThank you for visiting our website.\nWe have also sent you a confirmation email, please confirm your email address."        
        from_email = settings.EMAIL_HOST_USER
        to_list = [myuser.email]
        send_mail(subject, message, from_email, to_list, fail_silently=True)

        current_site = get_current_site(request)
        email_subject = "Confirm your Email!!"
        message2 = render_to_string('email_confirmation.html',{
            
            'name': myuser.first_name,
            'domain': current_site.domain,
            'uid': urlsafe_base64_encode(force_bytes(myuser.pk)),
            'token': generate_token.make_token(myuser)
        })
        email = EmailMessage(
        email_subject,
        message2,
        settings.EMAIL_HOST_USER,
        [myuser.email],
        )
        email.fail_silently = True
        email.send()

        return redirect('signin')
        
        
    return render(request, "authentication/signup.html")

def signin(request):
    if request.method == 'POST':
        username = request.POST['username']
        pass1 = request.POST['pass1']
        
        user = authenticate(username=username, password=pass1)
        
        if user is not None:
            login(request, user)
            # messages.success(request, "Logged In Sucessfully!!")
            return redirect("/home")
        else:
            # messages.error(request, "Bad Credentials!!")
            return redirect('/signin')
    
    return render(request, "authentication/signin.html")

def signout(request):
    logout(request)
    messages.success(request, "Logged Out Successfully!!")
    return redirect('/')

def activate(request,uidb64,token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        myuser = User.objects.get(pk=uid)
    except (TypeError,ValueError,OverflowError,User.DoesNotExist):
        myuser = None

    if myuser is not None and generate_token.check_token(myuser,token):
        myuser.is_active = True
        # user.profile.signup_confirmation = True
        myuser.save()
        login(request,myuser)
        messages.success(request, "Your Account has been activated!!")
        return redirect('/signin')
    else:
        return render(request,'activation_failed.html') 


@login_required(login_url="/authentication")
def my_profile(request):
    profile= Profile.objects.get(user=request.user)
    context = {'profile': profile}

    return render(request, 'myprofile.html',context)

@login_required(login_url="/authentication")
def invites_received_view(request):
    profile = Profile.objects.get(user=request.user)
    qs = Relationship.objects.invatations_received(profile)
    results = list(map(lambda x: x.sender, qs))
    is_empty = False
    if len(results) == 0:
        is_empty = True

    context = {
        'qs': results,
        'is_empty': is_empty,
    }
    return render(request, 'my_invites.html', context)

def accept_invatation(request):
    if request.method=="POST":
        pk = request.POST.get('profile_pk')
        sender = Profile.objects.get(pk=pk)
        receiver = Profile.objects.get(user=request.user)
        rel = get_object_or_404(Relationship, sender=sender, receiver=receiver)
        if rel.status == 'send':
            rel.status = 'accepted'
            rel.save()
    return redirect('authentication:my_invites')

def reject_invatation(request):
    if request.method=="POST":
        pk = request.POST.get('profile_pk')
        receiver = Profile.objects.get(user=request.user)
        sender = Profile.objects.get(pk=pk)
        rel = get_object_or_404(Relationship, sender=sender, receiver=receiver)
        rel.delete()
    return redirect('authentication:my_invites')



@login_required(login_url="authentication")
def profiles_list_view(request):
    user = request.user
    qs = Profile.objects.get_all_profiles(user)

    context = {'qs': qs}

    return render(request, 'profile_list.html', context)

def  invite_profiles_list_view(request):
    user=request.user
    qs= Profile.objects.get_all_profiles_to_invite(user)
    context={'qs':qs}
    return render(request, 'to_invite_list.html', context)

class  ProfileListView(ListView):
    model = Profile
    template_name = 'profile_list.html'

    def get_queryset(self):
        qs = Profile.objects.get_all_profiles(self.request.user)
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = User.objects.get(username__iexact=self.request.user)
        profile = Profile.objects.get(user=user)
        rel_r = Relationship.objects.filter(sender=profile)
        rel_s = Relationship.objects.filter(receiver=profile)
        rel_receiver = []
        rel_sender = []
        for item in rel_r:
            rel_receiver.append(item.receiver.user)
        for item in rel_s: 
            rel_sender.append(item.sender.user)
        context["rel_receiver"] = rel_receiver
        context["rel_sender"] = rel_sender
        context['is_empty'] = False
        if len(self.get_queryset()) == 0:
            context['is_empty'] = True

        return context

def send_invatation(request):
    if request.method=='POST':
        pk = request.POST.get('profile_pk')
        user = request.user
        sender = Profile.objects.get(user=user)
        receiver = Profile.objects.get(pk=pk)

        rel = Relationship.objects.create(sender=sender, receiver=receiver, status='send')

        return redirect(request.META.get('HTTP_REFERER'))
    return redirect('authentication:myprofile')
    
def remove_from_friends(request):
    if request.method=='POST':
        pk = request.POST.get('profile_pk')
        user = request.user
        sender = Profile.objects.get(user=user)
        receiver = Profile.objects.get(pk=pk)

        rel = Relationship.objects.get(
            (Q(sender=sender) & Q(receiver=receiver)) | (Q(sender=receiver) & Q(receiver=sender))
        )
        rel.delete()
        return redirect(request.META.get('HTTP_REFERER'))
    return redirect('authentication:myprofile')
