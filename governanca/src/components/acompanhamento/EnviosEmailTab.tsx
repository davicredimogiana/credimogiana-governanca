import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  RefreshCw, 
  CheckCircle2, 
  Circle, 
  Calendar,
  Clock,
  Users,
  FileText,
  Loader2
} from "lucide-react";
import { useEnviosEmail } from "@/hooks/useEnviosEmail";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function EnviosEmailTab() {
  const { enviosAgrupados, loading, estatisticas, refetch } = useEnviosEmail();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{estatisticas.totalEnvios}</p>
            <p className="text-sm text-muted-foreground">E-mails Enviados</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-primary/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{estatisticas.atasEnviadas}</p>
            <p className="text-sm text-muted-foreground">Atas Diferentes</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-success/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{estatisticas.lidos}</p>
            <p className="text-sm text-muted-foreground">Lidos</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-info/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-info">{estatisticas.taxaLeitura}%</p>
            <p className="text-sm text-muted-foreground">Taxa de Leitura</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Lista de Envios Agrupados */}
      <div className="space-y-4">
        {enviosAgrupados.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-8 text-center">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum e-mail de ata enviado ainda.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Quando você enviar atas por e-mail, o histórico aparecerá aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          enviosAgrupados.map((grupo) => (
            <Card key={`${grupo.ata_id}_${grupo.enviado_em}`} className="shadow-soft hover:shadow-medium transition-all">
              <CardContent className="p-5">
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {grupo.titulo}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        {grupo.data_reuniao && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(grupo.data_reuniao), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Enviado em {format(new Date(grupo.enviado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {grupo.destinatarios.length} {grupo.destinatarios.length === 1 ? "destinatário" : "destinatários"}
                  </Badge>
                </div>

                {/* Lista de Destinatários */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Destinatários:</p>
                  <div className="space-y-2">
                    {grupo.destinatarios.map((dest) => (
                      <div 
                        key={dest.id} 
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <span className="font-medium text-foreground">{dest.nome}</span>
                            <span className="text-muted-foreground ml-2">({dest.email})</span>
                            {dest.cargo && (
                              <span className="text-muted-foreground ml-2">- {dest.cargo}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {dest.lido ? (
                            <Badge className="bg-success/10 text-success border-success/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Lido
                              {dest.lido_em && (
                                <span className="ml-1 text-xs opacity-75">
                                  {format(new Date(dest.lido_em), "dd/MM HH:mm", { locale: ptBR })}
                                </span>
                              )}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              <Circle className="w-3 h-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
