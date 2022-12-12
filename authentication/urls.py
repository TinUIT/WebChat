from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView

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
            #  template_name='password-reset/password_reset.html',
            #  subject_template_name='password-reset/password_reset_subject.txt',
            #  email_template_name='password-reset/password_reset_email.html',
            #  success_url='/signin/'
         ),
         name='password_reset'),
    path('password-reset/done/',
         auth_views.PasswordResetDoneView.as_view(
            #  template_name='password-reset/password_reset_done.html'
         ),
         name='password_reset_done'),
    path('password-reset-confirm/<uidb64>/<token>/',
         auth_views.PasswordResetConfirmView.as_view(
            #  template_name='password-reset/password_reset_confirm.html'
         ),
         name='password_reset_confirm'),
    path('password-reset-complete/',
         auth_views.PasswordResetCompleteView.as_view(
            #  template_name='password-reset/password_reset_complete.html'
         ),
         name='password_reset_complete'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
