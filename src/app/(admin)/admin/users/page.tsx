'use client';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    UserPlus,
    Mail,
    ShieldCheck,
    MoreVertical,
    CheckCircle2,
    XCircle,
    UserCog,
    BadgeCheck,
    Ban,
    Eye,
    Bell
} from 'lucide-react';
import { toast } from 'sonner';
export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin-users-list'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/users');
            return data.data;
        },
    });
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            return axios.patch(`/api/admin/users/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
            toast.success('Utilisateur mis à jour');
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight italic font-black uppercase">Utilisateurs</h1>
                    <p className="text-muted-foreground">Gérez les accès et les rôles des clients et techniciens.</p>
                </div>
                <Button className="gap-2 font-black italic uppercase tracking-tighter">
                    <UserPlus className="h-4 w-4" />
                    Inviter un utilisateur
                </Button>
            </div>
            <Card className="border-2 border-primary/5 shadow-xl">
                <CardHeader className="border-b bg-muted/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher un utilisateur (nom, email)..." className="pl-10 bg-background border-primary/10 transition-all focus:border-primary/30" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                <p className="text-sm font-bold text-primary animate-pulse italic uppercase">Chargement des utilisateurs...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {users.map((user: any) => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-background hover:bg-primary/5 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary group-hover:scale-105 transition-transform">
                                            {(user.name || user.email).charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold flex items-center gap-2 text-lg">
                                                <Link href={`/admin/users/${user.id}`} className="hover:text-primary hover:underline transition-colors">
                                                    {user.name || 'Sans Nom'}
                                                </Link>
                                                {user.isActive ?
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                                                    <XCircle className="h-4 w-4 text-destructive" />
                                                }
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right flex flex-col items-end gap-1.5">
                                            <Badge
                                                variant={user.role === 'ADMIN' ? 'default' : user.role === 'TECHNICIEN' ? 'secondary' : 'outline'}
                                                className={`font-black italic uppercase tracking-tighter ${user.role === 'TECHNICIEN' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    user.role === 'CLIENT' ? 'bg-muted text-muted-foreground' : ''
                                                    }`}
                                            >
                                                {user.role}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground italic font-medium opacity-70">
                                                Depuis le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/20 hover:border-primary/20 border border-transparent transition-all">
                                                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-64 border-2 shadow-xl">
                                                <DropdownMenuLabel className="font-black italic uppercase text-[10px] tracking-widest text-muted-foreground py-2">Gestion utilisateur</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild className="gap-2 focus:bg-primary/10 focus:text-primary cursor-pointer font-bold py-2.5">
                                                    <Link href={`/admin/users/${user.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                        Voir le profil
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild className="gap-2 focus:bg-primary/10 focus:text-primary cursor-pointer font-bold py-2.5">
                                                    <Link href={`/admin/notifications?userId=${user.id}`}>
                                                        <Bell className="h-4 w-4" />
                                                        Envoyer une notification
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {user.role !== 'TECHNICIEN' && user.role !== 'ADMIN' && (
                                                    <DropdownMenuItem
                                                        className="gap-2 focus:bg-blue-500/10 focus:text-blue-500 cursor-pointer font-bold py-2.5"
                                                        onClick={() => updateMutation.mutate({ id: user.id, data: { role: 'TECHNICIEN' } })}
                                                    >
                                                        <BadgeCheck className="h-4 w-4" />
                                                        Nommer Technicien
                                                    </DropdownMenuItem>
                                                )}
                                                {user.role === 'TECHNICIEN' && (
                                                    <DropdownMenuItem
                                                        className="gap-2 focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer font-bold py-2.5"
                                                        onClick={() => updateMutation.mutate({ id: user.id, data: { role: 'CLIENT' } })}
                                                    >
                                                        <UserCog className="h-4 w-4" />
                                                        Retirer rôle Technicien
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                {user.isActive ? (
                                                    <DropdownMenuItem
                                                        className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-bold py-2.5"
                                                        onClick={() => {
                                                            if (confirm(`Désactiver le compte de ${user.name || user.email} ?`)) {
                                                                updateMutation.mutate({ id: user.id, data: { isActive: false } });
                                                            }
                                                        }}
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                        Désactiver le compte
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        className="gap-2 text-green-600 focus:bg-green-500/10 focus:text-green-600 cursor-pointer font-bold py-2.5"
                                                        onClick={() => updateMutation.mutate({ id: user.id, data: { isActive: true } })}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Réactiver le compte
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
