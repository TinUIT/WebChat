from django.db import models

# Create your models here.
class User_chat (models.Model):
    username = models.CharField(default="", max_length= 10)
    email = models.CharField(default="", max_length= 20)
    firstname = models.CharField(default="", max_length= 20)
    lastname = models.CharField(default="", max_length= 20)
    password = models.CharField(default="", max_length= 20)