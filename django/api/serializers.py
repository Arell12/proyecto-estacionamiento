from rest_framework import serializers
from .models import (Anios, Credenciales, DatosAuto, Estacionamientos, Eventosespeciales, Historial, Horaspico, Marcas, Modelos, Reportes, Roles, TiposIncidencia, UsuarioAutomovil, Usuarios,)

# Serializers básicos
class AniosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Anios
        fields = ('id_anio', 'anio')


class RolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = ('id_rol', 'nombre_rol', 'descripcion')


class MarcasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marcas
        fields = ('id_marca', 'nombre_marca')


class TiposIncidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposIncidencia
        fields = ('id_tipo_incidencia', 'nombre', 'descripcion')


# Serializers con llaves foráneas
class UsuariosSerializer(serializers.ModelSerializer):
    id_rol = serializers.PrimaryKeyRelatedField(queryset=Roles.objects.all())

    class Meta:
        model = Usuarios
        fields = (
            'id_usuario', 'numero_control', 'nombre', 'apellidos',
            'correo_electronico', 'fecha_nacimiento', 'telefono',
            'foto_perfil', 'capacidades_diferentes', 'id_rol'
        )

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['rol'] = RolesSerializer(instance.id_rol).data
        return representation


class ModelosSerializer(serializers.ModelSerializer):
    id_marca = serializers.PrimaryKeyRelatedField(queryset=Marcas.objects.all())

    class Meta:
        model = Modelos
        fields = ('id_modelo', 'nombre_modelo', 'id_marca')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['marca'] = MarcasSerializer(instance.id_marca).data
        return representation


class DatosAutoSerializer(serializers.ModelSerializer):
    id_marca = serializers.PrimaryKeyRelatedField(queryset=Marcas.objects.all())
    id_modelo = serializers.PrimaryKeyRelatedField(queryset=Modelos.objects.all())
    id_anio = serializers.PrimaryKeyRelatedField(queryset=Anios.objects.all())

    class Meta:
        model = DatosAuto
        fields = ('id_datos_auto', 'id_marca', 'id_modelo', 'id_anio')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['marca'] = MarcasSerializer(instance.id_marca).data
        representation['modelo'] = ModelosSerializer(instance.id_modelo).data
        representation['anio'] = AniosSerializer(instance.id_anio).data
        return representation


class CredencialesSerializer(serializers.ModelSerializer):
    id_usuario = serializers.PrimaryKeyRelatedField(queryset=Usuarios.objects.all())

    class Meta:
        model = Credenciales
        fields = ('id_credencial', 'id_usuario', 'contrasena')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['usuario'] = UsuariosSerializer(instance.id_usuario).data
        return representation


class EstacionamientosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estacionamientos
        fields = ('id_estacionamiento', 'numero_estacionamiento', 'es_reservado', 'esta_ocupado')


class UsuarioAutomovilSerializer(serializers.ModelSerializer):
    id_usuario = serializers.PrimaryKeyRelatedField(queryset=Usuarios.objects.all())
    id_datos_auto = serializers.PrimaryKeyRelatedField(queryset=DatosAuto.objects.all())

    class Meta:
        model = UsuarioAutomovil
        fields = ('id_usuario_automovil', 'id_usuario', 'id_datos_auto', 'placas')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['usuario'] = UsuariosSerializer(instance.id_usuario).data
        representation['datos_auto'] = DatosAutoSerializer(instance.id_datos_auto).data
        return representation


class HoraspicoSerializer(serializers.ModelSerializer):
    id_usuario = serializers.PrimaryKeyRelatedField(queryset=Usuarios.objects.all())

    class Meta:
        model = Horaspico
        fields = ('id_hora_pico', 'id_usuario', 'dia', 'hora_inicio', 'hora_fin')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['usuario'] = UsuariosSerializer(instance.id_usuario).data
        return representation


class EventosespecialesSerializer(serializers.ModelSerializer):
    id_usuario = serializers.PrimaryKeyRelatedField(queryset=Usuarios.objects.all())

    class Meta:
        model = Eventosespeciales
        fields = ('id_evento', 'id_usuario', 'nombre_evento', 'fecha_evento', 'hora_evento', 'descripcion_evento')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['usuario'] = UsuariosSerializer(instance.id_usuario).data
        return representation


class HistorialSerializer(serializers.ModelSerializer):
    id_usuario_automovil = serializers.PrimaryKeyRelatedField(queryset=UsuarioAutomovil.objects.all())
    id_estacionamiento = serializers.PrimaryKeyRelatedField(queryset=Estacionamientos.objects.all())

    class Meta:
        model = Historial
        fields = (
            'id_historial', 'id_usuario_automovil', 'id_estacionamiento',
            'fecha_entrada', 'hora_entrada', 'fecha_salida', 'hora_salida'
        )

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['usuario_automovil'] = UsuarioAutomovilSerializer(instance.id_usuario_automovil).data
        representation['estacionamiento'] = EstacionamientosSerializer(instance.id_estacionamiento).data
        return representation


class ReportesSerializer(serializers.ModelSerializer):
    id_usuario_reporta = serializers.PrimaryKeyRelatedField(queryset=Usuarios.objects.all())
    id_usuario_resuelve = serializers.PrimaryKeyRelatedField(queryset=Usuarios.objects.all(), allow_null=True)
    id_estacionamiento = serializers.PrimaryKeyRelatedField(queryset=Estacionamientos.objects.all())
    id_tipo_incidencia = serializers.PrimaryKeyRelatedField(queryset=TiposIncidencia.objects.all())

    class Meta:
        model = Reportes
        fields = (
            'id_reporte', 'id_usuario_reporta', 'id_usuario_resuelve',
            'id_estacionamiento', 'id_tipo_incidencia', 'descripcion_problema',
            'fotografia', 'fecha_creacion', 'esta_solucionado', 'esta_proceso'
        )

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['usuario_reporta'] = UsuariosSerializer(instance.id_usuario_reporta).data
        representation['usuario_resuelve'] = UsuariosSerializer(instance.id_usuario_resuelve).data if instance.id_usuario_resuelve else None
        representation['estacionamiento'] = EstacionamientosSerializer(instance.id_estacionamiento).data
        representation['tipo_incidencia'] = TiposIncidenciaSerializer(instance.id_tipo_incidencia).data
        return representation
