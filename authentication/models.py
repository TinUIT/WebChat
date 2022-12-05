from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver #add this
from django.db.models.signals import post_save #add this
# Create your models here.
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

    @receiver(post_save, sender=User) 
    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            Profile.objects.create(user=instance)
    
    @receiver(post_save, sender=User) 
    def save_user_profile(sender, instance, **kwargs):
        instance.profile.save()
