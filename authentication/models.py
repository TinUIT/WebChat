from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Profile (models.Model):
    User = models.ForeignKey(User, on_delete=models.CASCADE)
    