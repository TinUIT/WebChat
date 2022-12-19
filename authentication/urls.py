from django.contrib import admin
from django.urls import path, include
from . import views
from .views import *
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView


app_name = 'authentication'

urlpatterns = [
    path('', views.authentication, name='authentication'),
    path('home', views.home, name="home"),
    path('chat', views.chat, name="chat"),
    path('profile', views.profile, name="profile"),
    path('signup', views.signup, name="signup"),
    path('signin', views.signin, name="signin"),
    path('signout', views.signout, name="signout"),
    path('videochat', views.videochat, name="videochat"),
    path('changepassword', views.changepassword, name="changepassword"),
    path('myprofile', views.my_profile, name='myprofile'),
    path('my_invites', views.invites_received_view, name="my_invites"),
    path('all-profiles', ProfileListView.as_view(), name='all-profile-view'),
    path('to-invite', views.invite_profiles_list_view, name='invite-profile-view'),
    path('send_invite', views.send_invatation, name='send_invite'),
    path('remove_friend', views.remove_from_friends, name='remove_friend'),
    path('accept_invatation', views.accept_invatation, name='accept_invatation'),
    path('reject_invatation', views.reject_invatation, name='reject_invatation'),
    path('activate/<uidb64>/<token>', views.activate, name='activate'),
    path(
        'change-password/',
        auth_views.PasswordChangeView.as_view(
            template_name='password-reset/change-password.html',
            success_url='/'
        ),
        name='change_password'
    ),
    path('password-reset/',
         auth_views.PasswordResetView.as_view(
             template_name='password-reset/password_reset.html',
             email_template_name='password-reset/password_reset_email.html',
         ),
         name='password_reset'),
    path('password-reset/done/',
         auth_views.PasswordResetDoneView.as_view(
             template_name='password-reset/password_reset_done.html'
         ),
         name='password_reset_done'),
    path('password-reset-confirm/<uidb64>/<token>/',
         auth_views.PasswordResetConfirmView.as_view(
             template_name='password-reset/password_reset_confirm.html'
         ),
         name='password_reset_confirm'),
    path('password-reset-complete/',
         auth_views.PasswordResetCompleteView.as_view(
             template_name='password-reset/password_reset_complete.html'
         ),
         name='password_reset_complete'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
