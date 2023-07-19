from django.db import models


class Feedback(models.Model):
    class Meta(object):
        db_table = 'feedback'
        ordering = ['-created_at']

    name = models.CharField('Name', blank=True, null=True, max_length=80)
    email = models.EmailField('Email', blank=True, null=True, max_length=254)
    message = models.TextField('Message', blank=False, null=False)
    created_at = models.DateTimeField('Created At', blank=True, auto_now_add=True)
