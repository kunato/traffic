from tastypie.authentication import SessionAuthentication


class AnonymousGetAuthentication(SessionAuthentication):
    def is_authenticated(self, request, **kwargs):
        if request.method == 'GET':
            return True
        return super(AnonymousGetAuthentication,self).is_authenticated(request, **kwargs)