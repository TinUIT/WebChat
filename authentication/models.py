from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Profile (models.Model):
    GENDER = [
        ("M","male"),
        ("F","female")
    ]
    email = models.ForeignKey(User, on_delete=models.CASCADE)
    year = models.IntegerField()
    gender = models.CharField(default="",max_length=6,choices=GENDER)