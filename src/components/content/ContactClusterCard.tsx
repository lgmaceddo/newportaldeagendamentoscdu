import { useState } from "react";
import { Phone, ChevronDown, ChevronUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContactPoint } from "@/types/data";
import { ContactPointCard } from "./ContactPointCard";

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
        <Card className={`transition-all duration-300 border-l-4 ${isExpanded ? 'border-l-primary shadow-md' : 'border-l-transparent hover:border-l-primary/50'}`}>
            <CardContent className="p-0">
                <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-primary text-primary-foreground' : 'bg-primary/5 text-primary'}`}>
                            {points.length > 1 ? <Users className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                                {mainSector}
                                <Badge variant="secondary" className="text-xs font-normal">
                                    {points.length} {points.length === 1 ? 'contato' : 'contatos'}
                                </Badge>
                            </h4>
                            {!isExpanded && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Toque para ver detalhes
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="text-muted-foreground">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                </div>

                {/* Lista Expandida */}
                {isExpanded && (
                    <div className="p-3 pt-0 bg-muted/10 space-y-3 border-t border-dashed">
                        <div className="h-2"></div> {/* Spacing */}
                        {sortedPoints.map((point) => (
                            <ContactPointCard
                                key={point.id}
                                point={point}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                canEdit={canEdit}
                            />
                        ))}
                        <div className="h-1"></div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
