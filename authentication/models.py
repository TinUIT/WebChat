from django.db import models

# Create your models here.
class User_chat (models.Model):
    HOBBY = [
        ('Reading', 'R'),
        ('Listening to music', 'L'),
        ('Play Sport', 'PS'),
    ]
    username = models.CharField(default="", max_length= 10)
    email = models.CharField(default="", max_length= 20)
    hobby = models.CharField(max_length=20, choices= HOBBY)