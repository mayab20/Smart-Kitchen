from django.urls import path, include
from rest_framework.routers import DefaultRouter
<<<<<<< HEAD
from .views import ProfileViewSet, EmailUpdateView, PasswordUpdateView
=======
from rest_framework_simplejwt.views import TokenRefreshView
from .views import ProfileViewSet, EmailUpdateView, PasswordUpdateView, RegisterView, LoginView, LogoutView
>>>>>>> b79390174dfbcc4df893cab4adaee3677bbebf74

router = DefaultRouter()
router.register(r'profile', ProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
<<<<<<< HEAD
=======
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
>>>>>>> b79390174dfbcc4df893cab4adaee3677bbebf74
    path('update-email/', EmailUpdateView.as_view(), name='update-email'),
    path('update-password/', PasswordUpdateView.as_view(), name='update-password'),
]