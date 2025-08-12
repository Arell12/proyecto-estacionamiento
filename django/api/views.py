from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import (Anios, Credenciales, DatosAuto, Estacionamientos, Eventosespeciales, Historial, Horaspico, Marcas, Modelos, Reportes, Roles, TiposIncidencia, UsuarioAutomovil, Usuarios,)
from .serializers import (AniosSerializer, CredencialesSerializer, DatosAutoSerializer, EstacionamientosSerializer, EventosespecialesSerializer, HistorialSerializer, HoraspicoSerializer, MarcasSerializer, ModelosSerializer, ReportesSerializer, RolesSerializer, TiposIncidenciaSerializer, UsuarioAutomovilSerializer, UsuariosSerializer,)

import random
import string
from django.core.mail import send_mail
from django.http import JsonResponse



# ViewSets
class AniosViewSet(viewsets.ModelViewSet):
    serializer_class = AniosSerializer
    queryset = Anios.objects.all()


class RolesViewSet(viewsets.ModelViewSet):
    serializer_class = RolesSerializer
    queryset = Roles.objects.all()


class MarcasViewSet(viewsets.ModelViewSet):
    serializer_class = MarcasSerializer
    queryset = Marcas.objects.all()


class TiposIncidenciaViewSet(viewsets.ModelViewSet):
    serializer_class = TiposIncidenciaSerializer
    queryset = TiposIncidencia.objects.all()


class UsuariosViewSet(viewsets.ModelViewSet):
    serializer_class = UsuariosSerializer
    queryset = Usuarios.objects.all()


class ModelosViewSet(viewsets.ModelViewSet):
    serializer_class = ModelosSerializer
    queryset = Modelos.objects.all()


class DatosAutoViewSet(viewsets.ModelViewSet):
    serializer_class = DatosAutoSerializer
    queryset = DatosAuto.objects.all()


class CredencialesViewSet(viewsets.ModelViewSet):
    serializer_class = CredencialesSerializer
    queryset = Credenciales.objects.all()


class EstacionamientosViewSet(viewsets.ModelViewSet):
    serializer_class = EstacionamientosSerializer
    queryset = Estacionamientos.objects.all()


class UsuarioAutomovilViewSet(viewsets.ModelViewSet):
    serializer_class = UsuarioAutomovilSerializer
    queryset = UsuarioAutomovil.objects.all()


class HoraspicoViewSet(viewsets.ModelViewSet):
    serializer_class = HoraspicoSerializer
    queryset = Horaspico.objects.all()


class EventosespecialesViewSet(viewsets.ModelViewSet):
    serializer_class = EventosespecialesSerializer
    queryset = Eventosespeciales.objects.all()


class HistorialViewSet(viewsets.ModelViewSet):
    serializer_class = HistorialSerializer
    queryset = Historial.objects.all()


class ReportesViewSet(viewsets.ModelViewSet):
    serializer_class = ReportesSerializer
    queryset = Reportes.objects.all()



#Vistas personalizadas
class LoginView(APIView):
    """
    Vista personalizada para manejar el login de usuarios según su rol.
    """
    def post(self, request):
        numero_control = request.data.get('numero_control')
        contrasena = request.data.get('contrasena')

        if not numero_control or not contrasena:
            return Response({'error': 'Número de control y contraseña son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Buscar al usuario por número de control
            usuario = Usuarios.objects.get(numero_control=numero_control)
            
            # Validar la contraseña en texto plano
            credencial = Credenciales.objects.get(id_usuario=usuario)
            if credencial.contrasena != contrasena:
                return Response({'error': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

            # Determinar el rol del usuario
            if usuario.id_rol.id_rol == 1:
                rol = 'Estudiante'
            elif usuario.id_rol.id_rol == 2:
                rol = 'Guardia'
            elif usuario.id_rol.id_rol == 3:
                rol = 'Administrativo'
            else:
                return Response({'error': 'Rol no identificado.'}, status=status.HTTP_401_UNAUTHORIZED)

            # Respuesta exitosa
            return Response({
                'mensaje': 'Login exitoso.',
                'id_usuario': usuario.id_usuario,  # Incluyendo el id_usuario
                'numero_control': usuario.numero_control,
                'nombre': usuario.nombre,
                'rol': rol
            }, status=status.HTTP_200_OK)

        except Usuarios.DoesNotExist:
            return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        except Credenciales.DoesNotExist:
            return Response({'error': 'Credenciales no configuradas para este usuario.'}, status=status.HTTP_404_NOT_FOUND)


class RecuperarContrasenaView(APIView):
    """
    Vista para recuperar la contraseña.
    """

    def post(self, request):
        email = request.data.get('correo_electronico')  # Recibe el correo desde el cuerpo de la petición

        if not email:
            return JsonResponse({'error': 'El correo electrónico es obligatorio.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verificar si el correo existe
            usuario = Usuarios.objects.get(correo_electronico=email)
            credencial = Credenciales.objects.get(id_usuario=usuario)

            # Generar una nueva contraseña aleatoria
            nueva_contrasena = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

            # Actualizar la contraseña en la tabla Credenciales
            credencial.contrasena = nueva_contrasena  # Como es un prototipo, no encriptamos la contraseña
            credencial.save()

            # Enviar la nueva contraseña por correo
            asunto = "Cambio de Contraseña TecPark"
            mensaje = (
                f"Hola {usuario.nombre},\n\n"
                f"Tu contraseña ha sido restablecida. Ahora puedes iniciar sesión con la siguiente contraseña:\n\n"
                f"Contraseña: {nueva_contrasena}\n\n"
                f"Te recomendamos cambiarla inmediatamente después de iniciar sesión.\n\n"
                f"Saludos,\nEl equipo de TecPark."
            )
            remitente = 'contacto@tecpark.site'  # El correo configurado en settings.py
            destinatarios = [email]

            send_mail(asunto, mensaje, remitente, destinatarios)

            return JsonResponse({'mensaje': 'La nueva contraseña ha sido enviada al correo proporcionado.'}, status=status.HTTP_200_OK)

        except Usuarios.DoesNotExist:
            return JsonResponse({'error': 'El correo no está registrado.'}, status=status.HTTP_404_NOT_FOUND)
        except Credenciales.DoesNotExist:
            return JsonResponse({'error': 'El usuario no tiene credenciales configuradas.'}, status=status.HTTP_404_NOT_FOUND)
