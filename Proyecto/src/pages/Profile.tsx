
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Save, CreditCard, Crown } from 'lucide-react';
import { Facultad } from '@/types/subscription';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  cedula: string | null;
  apellido: string | null;
  codigo_unico: string | null;
  celular: string | null;
  facultad: string | null;
  es_aportante: boolean;
  tipo_aportacion: string | null;
}

const Profile = () => {
  const { user } = useAuth();
  const { userSubscription, plans } = useSubscriptions();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    apellido: '',
    cedula: '',
    codigo_unico: '',
    phone: '',
    celular: '',
    address: '',
    facultad: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          name: data.name || '',
          apellido: data.apellido || '',
          cedula: data.cedula || '',
          codigo_unico: data.codigo_unico || '',
          phone: data.phone || '',
          celular: data.celular || '',
          address: data.address || '',
          facultad: data.facultad || ''
        });
      } else {
        // Create user profile if it doesn't exist
        const newProfile = {
          auth_id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || '',
          apellido: user.user_metadata?.apellido || '',
          cedula: user.user_metadata?.cedula || '',
          codigo_unico: user.user_metadata?.codigo_unico || '',
          celular: user.user_metadata?.celular || '',
          facultad: user.user_metadata?.facultad || '',
          es_aportante: user.user_metadata?.es_aportante || false,
          phone: null,
          address: null
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;

        setProfile(createdProfile);
        setFormData({
          name: createdProfile.name || '',
          apellido: createdProfile.apellido || '',
          cedula: createdProfile.cedula || '',
          codigo_unico: createdProfile.codigo_unico || '',
          phone: createdProfile.phone || '',
          celular: createdProfile.celular || '',
          address: createdProfile.address || '',
          facultad: createdProfile.facultad || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          apellido: formData.apellido,
          cedula: formData.cedula,
          codigo_unico: formData.codigo_unico,
          phone: formData.phone || null,
          celular: formData.celular,
          address: formData.address || null,
          facultad: formData.facultad
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se guardaron correctamente"
      });

      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const currentPlan = plans.find(p => p.id === userSubscription?.plan_id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y suscripción</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Información Personal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          name: e.target.value
                        })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        value={formData.apellido}
                        onChange={(e) => setFormData({
                          ...formData,
                          apellido: e.target.value
                        })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cedula">Cédula</Label>
                      <Input
                        id="cedula"
                        value={formData.cedula}
                        onChange={(e) => setFormData({
                          ...formData,
                          cedula: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="codigo_unico">Código Único</Label>
                      <Input
                        id="codigo_unico"
                        value={formData.codigo_unico}
                        onChange={(e) => setFormData({
                          ...formData,
                          codigo_unico: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Ej: +593 2 123 4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          phone: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="celular">Celular</Label>
                      <Input
                        id="celular"
                        type="tel"
                        placeholder="Ej: +593 99 123 4567"
                        value={formData.celular}
                        onChange={(e) => setFormData({
                          ...formData,
                          celular: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="facultad">Facultad</Label>
                    <Select 
                      value={formData.facultad} 
                      onValueChange={(value) => setFormData({
                        ...formData,
                        facultad: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu facultad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Facultad.FIS}>FIS</SelectItem>
                        <SelectItem value={Facultad.FICA}>FICA</SelectItem>
                        <SelectItem value={Facultad.FIQ}>FIQ</SelectItem>
                        <SelectItem value={Facultad.FCA}>FCA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      placeholder="Calle, número, colonia, ciudad..."
                      value={formData.address}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: e.target.value
                      })}
                    />
                  </div>

                  <Button type="submit" disabled={saving} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {profile?.es_aportante && currentPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <span>Plan Actual</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-primary">{currentPlan.name}</h3>
                    <p className="text-2xl font-bold text-gray-900">${currentPlan.price}/mes</p>
                    <p className="text-sm text-gray-600">Casillero: ${currentPlan.precio_casillero}</p>
                    <Button className="mt-4 w-full" variant="outline">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Ver Planes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información de Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{profile?.email}</p>
                  </div>
                </div>

                {formData.celular && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Celular</p>
                      <p className="text-sm text-gray-600">{formData.celular}</p>
                    </div>
                  </div>
                )}

                {formData.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Dirección</p>
                      <p className="text-sm text-gray-600">{formData.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Alquileres totales</span>
                    <span className="text-sm font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tipo de usuario</span>
                    <span className="text-sm font-medium">
                      {profile?.es_aportante ? 'Aportante' : 'Estándar'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Miembro desde</span>
                    <span className="text-sm font-medium">
                      {new Date(user?.created_at || '').toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
