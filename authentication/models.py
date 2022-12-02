from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Profile (models.Model):
    GENDER = [
        ("M","male"),
        ("F","female")
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, primary_key=True,default="",unique=True)
    birthday = models.DateField(blank=True,null=True)
    gender = models.CharField(max_length=6,choices=GENDER, default="M")