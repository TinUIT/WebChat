from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Profile (models.Model):
    email = models.ForeignKey(User, on_delete=models.CASCADE,primary_key=True)
    year = models.IntegerField()