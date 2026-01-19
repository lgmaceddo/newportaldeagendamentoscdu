import { useState } from "react";
import { Phone, MapPin, MessageCircle, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactPoint } from "@/types/data";
import { cn } from "@/lib/utils";

interface ContactClusterCardProps {
    points: ContactPoint[];
    onEdit: (point: ContactPoint) => void;
    onDelete: (pointId: string) => void;
    canEdit: boolean;
}

export const ContactClusterCard = ({ points, onEdit, onDelete, canEdit }: ContactClusterCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const mainSector = points[0]?.setor || "Contato";

    // Ordena os pontos por local ou ramal
    const sortedPoints = [...points].sort((a, b) => (a.local || "").localeCompare(b.local || ""));

    return (
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setIsExpanded(!isExpanded)}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full text-primary">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                                {mainSector}
                                <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground hover:bg-muted">
                                    {points.length} ramais
                                </Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                Clique para ver todos os contatos deste setor
                            </p>
                        </div>
                    </div>

                    <div>
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />}
                    </div>
                </div>

                {/* Lista Expandida */}
                {isExpanded && (
                    <div className="mt-4 space-y-3 pl-1 border-t pt-3">
                        {sortedPoints.map((point) => (
                            <div key={point.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                                <div className="space-y-1 flex-1">
                                    {/* Local e Ramal */}
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                        {point.local && (
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {point.local}
                                            </span>
                                        )}

                                        {point.ramal && (
                                            <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded text-sm">
                                                Ramal: {point.ramal}
                                            </span>
                                        )}

                                        {point.telefone && (
                                            <span className="font-medium">
                                                Tel: {point.telefone}
                                            </span>
                                        )}

                                        {point.whatsapp && (
                                            <span className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                                <MessageCircle className="h-3 w-3" />
                                                {point.whatsapp}
                                            </span>
                                        )}
                                    </div>

                                    {/* Descrição opcional */}
                                    {point.description && (
                                        <p className="text-xs text-muted-foreground italic pl-1 border-l-2 border-primary/20">
                                            {point.description}
                                        </p>
                                    )}
                                </div>

                                {canEdit && (
                                    <div className="flex items-center gap-1 self-end sm:self-center">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7"
                                            onClick={(e) => { e.stopPropagation(); onEdit(point); }}
                                            title="Editar este ponto"
                                        >
                                            <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                            onClick={(e) => { e.stopPropagation(); onDelete(point.id); }}
                                            title="Excluir este ponto"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
