from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver #add this
from django.db.models.signals import post_save #add this
from django.db.models import Q


#Create your models here.

class ProfileManager(models.Manager):

    def get_all_profiles_to_invite(self, sender):
        profiles = Profile.objects.all().exclude(user=sender)
        profile = Profile.objects.get(user=sender)
        qs = Relationship.objects.filter(Q(sender=profile) | Q(receiver=profile))
        print(qs)
        print("#########")

        accepted = set([])
        for rel in qs:
            if rel.status == 'accepted':
                accepted.add(rel.receiver)
                accepted.add(rel.sender)
        print(accepted)
        print("#########")

        available = [profile for profile in profiles if profile not in accepted]
        print(available)
        print("#########")
        return available
        

    def get_all_profiles(self, me):
        profiles = Profile.objects.all().exclude(user=me)
        return profiles

class Profile (models.Model):
    GENDER = [
        ("M","male"),
        ("F","female")
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True,default="")
    name = models.CharField(max_length=200,null=True)
    birthday = models.CharField(max_length=4,null=True)
    gender = models.CharField(max_length=6,choices=GENDER, default="M")
    city=models.CharField(max_length=200,null=True)
    avatar=models.ImageField(upload_to="static/media/",null=True, blank=True)
    friends=models.ManyToManyField(User, related_name='friends',blank=True)
    objects = ProfileManager()


    @receiver(post_save, sender=User) 
    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            Profile.objects.create(user=instance)
    
    @receiver(post_save, sender=User) 
    def save_user_profile(sender, instance, **kwargs):
        instance.profile.save()

    def get_friends(self):
        return self.friends.all()

    def get_friends_no(self):
        return self.friends.all().count()

    def __str__(self):
        return str(self.user)


STATUS_CHOICES= (
    ('send','send'),
    ('accepted', 'accepted')
)


class RelationshipManager(models.Manager):
    def invatations_received(self, receiver):
        qs = Relationship.objects.filter(receiver=receiver, status='send')
        return qs


class Relationship(models.Model):
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE,related_name='sender')
    receiver = models.ForeignKey(Profile, on_delete=models.CASCADE,related_name='receiver')
    status = models.CharField(max_length=8, choices=STATUS_CHOICES)
    updated=models.DateTimeField(auto_now=True)
    created=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}-{self.receiver}-{self.status}"
    objects = RelationshipManager()

