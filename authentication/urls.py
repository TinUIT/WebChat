from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('', views.authentication, name='authentication'),
    path('home', views.home, name = "home"),
    path('chat', views.chat, name = "chat"),
    path('profile', views.profile, name = "profile"),
    path('signup', views.signup, name="signup"),
    path('signin', views.signin, name="signin"),
    path('signout', views.signout, name="signout"),
    path('activate/<uidb64>/<token>', views.activate, name='activate'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
