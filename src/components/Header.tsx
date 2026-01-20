import { Bell, MapPin, Phone, MessageCircle, Pencil, UserCircle2, Moon, Sun, LogOut, X, Clock, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { HeaderTagModal } from "@/components/modals/HeaderTagModal";
import { HeaderTagInfo } from "@/types/data";
import unimedLogo from "@/assets/unimed-bauru-logo-edited.png";
import { GlobalSearch } from "@/components/GlobalSearch";

interface HeaderProps {
  onNotificationClick: () => void;
  notificationCount: number;
  userName: string;
  setUserName: (name: string) => void;
  headerTagData: HeaderTagInfo[];
  updateHeaderTag: (id: string, updates: Omit<HeaderTagInfo, "id" | "tag">) => void;
  onMigrationClick: () => void;
  isLoading?: boolean;
  onSyncClick?: () => void;
}

export const Header = ({
  onNotificationClick,
  notificationCount,
  userName,
  setUserName,
  headerTagData,
  updateHeaderTag,
  onMigrationClick,
  isLoading,
  onSyncClick,
}: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();
  const [editingTag, setEditingTag] = useState<HeaderTagInfo | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Atualizar o relógio a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isEditingName && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [isEditingName]);

  const handleEditClick = (tag: HeaderTagInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTag(tag);
  };

  const handleSaveTag = (updates: Omit<HeaderTagInfo, "id" | "tag">) => {
    if (editingTag) {
      updateHeaderTag(editingTag.id, updates);
    }
  };

  const handleNameClick = () => {
    setTempName(userName || "");
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
      setTempName("");
    }
  };

  // Formatar hora atual
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <>
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="w-full px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src={unimedLogo}
              alt="Unimed Bauru CDU"
              className="h-12 w-auto object-contain rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
            />
            <div className="flex flex-col justify-center leading-none">
              {/* Revertido para EQUIPE DE AGENDAMENTO CDU */}
              <h1 className="text-2xl font-bold m-0 leading-none">EQUIPE DE AGENDAMENTO CDU</h1>
              <p className="text-sm opacity-90 m-0 leading-none" style={{ color: '#87E1D1' }}>
                Scripts, fluxos e atualizações em um só lugar.
              </p>
            </div>
          </div>
          <div className="hidden md:block flex-shrink-0">
            <h2 className="text-2xl font-dancing font-semibold tracking-wide text-white">
              Juntos pelo melhor atendimento!
            </h2>
          </div>
        </div>
        <div className="shadow-md" style={{ backgroundColor: '#0F766E' }}>
          <div className="w-full px-6 py-2 flex justify-between items-center">
            <div className="flex-shrink-0 flex items-center gap-4">
              {/* User Info Block */}
              <div className="flex flex-col justify-center">
                {isEditingName ? (
                  <div className="flex items-center gap-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all px-3 py-1 rounded-lg">
                    <UserCircle2 className="h-5 w-5 text-primary-foreground font-bold" />
                    <Input
                      ref={searchInputRef}
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={handleNameSave}
                      onKeyDown={handleNameKeyDown}
                      className="h-6 w-48 bg-transparent border-none text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-0 p-0 font-bold"
                      placeholder="Digite seu nome"
                    />
                  </div>
                ) : (
                  <button
                    onClick={handleNameClick}
                    className="flex items-center gap-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all font-bold text-primary-foreground px-3 py-1 rounded-lg group"
                  >
                    <UserCircle2 className="h-5 w-5 font-bold" />
                    <span className="font-bold">{userName || "Seu Nome"}</span>
                    <Pencil className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity ml-1" />
                  </button>
                )}
                <div className="flex items-center gap-3 ml-3 mt-1">
                  {user?.email && (
                    // Email do usuário em negrito
                    <p className="text-xs text-primary-foreground/70 truncate max-w-[200px] font-bold" title={user.email}>
                      {user.email}
                    </p>
                  )}
                  {/* Relógio em negrito */}
                  <div className="flex items-center gap-1 text-primary-foreground font-bold text-xs">
                    <Clock className="h-3.5 w-3.5 font-bold" />
                    <span>{formatTime(currentTime)}</span>
                  </div>
                </div>
              </div>

              {/* Ícone de modo dark em negrito */}
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10 font-bold"
                onClick={toggleTheme}
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5 text-primary-foreground font-bold" />
                ) : (
                  <Sun className="h-5 w-5 text-primary-foreground font-bold" />
                )}
              </Button>
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Sync Status Button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all text-primary-foreground font-bold",
                  isLoading && "animate-pulse"
                )}
                onClick={onSyncClick}
                disabled={isLoading}
                title={isLoading ? "Sincronizando com o servidor..." : "Sincronizar dados agora"}
              >
                <div className="relative">
                  <Database className={cn("h-5 w-5 text-primary-foreground font-bold", isLoading && "animate-spin-slow")} />
                  {isLoading && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                  )}
                </div>
              </Button>

              {/* Global Search */}
              <GlobalSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

              <Button
                variant="ghost"
                size="icon"
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all text-primary-foreground font-bold"
                onClick={onMigrationClick}
                title="Migrar Backup"
              >
                <Database className="h-5 w-5 text-primary-foreground font-bold" />
              </Button>

              <div className="flex space-x-1">
                {headerTagData.map((tagInfo) => (
                  <HoverCard key={tagInfo.id} openDelay={200}>
                    <HoverCardTrigger asChild>
                      {/* Botão do tagInfo em negrito */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all font-bold text-primary-foreground"
                      >
                        {tagInfo.tag}
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent
                      className="w-96 max-h-[420px] p-0 bg-card border-2 border-primary/10 shadow-2xl overflow-hidden flex flex-col"
                      side="bottom"
                      align="end"
                    >
                      {/* Header do Card com fundo #ECFDF5 */}
                      <div
                        className="px-5 py-2.5 flex items-center justify-between flex-shrink-0"
                        style={{ backgroundColor: '#ECFDF5' }}
                      >
                        {/* Título do card em negrito */}
                        <h3 className="text-[13px] font-bold text-primary uppercase tracking-wider leading-tight pr-2">
                          {tagInfo.title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-50 hover:opacity-100 transition-opacity hover:bg-primary/10 rounded-full flex-shrink-0"
                          onClick={(e) => handleEditClick(tagInfo, e)}
                        >
                          <Pencil className="h-3.5 w-3.5 text-primary font-bold" />
                        </Button>
                      </div>

                      {/* Separador discreto */}
                      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent flex-shrink-0" />

                      {/* Conteúdo do Card */}
                      <div className="px-5 py-4 space-y-3 overflow-y-auto">
                        {tagInfo.address && (
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-md bg-primary/5 flex-shrink-0">
                              {/* Ícone de endereço em negrito */}
                              <MapPin className="h-4 w-4 text-primary font-bold" />
                            </div>
                            {/* Texto de endereço em negrito */}
                            <span className="text-[13px] text-foreground/85 leading-relaxed font-bold">
                              {tagInfo.address}
                            </span>
                          </div>
                        )}

                        {tagInfo.phones && tagInfo.phones.length > 0 && (
                          <div className="space-y-2.5">
                            {tagInfo.phones.map((phone, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 rounded-md bg-primary/5 flex-shrink-0">
                                  {/* Ícone de telefone em negrito */}
                                  <Phone className="h-4 w-4 text-primary font-bold" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  {/* Label do telefone em negrito */}
                                  <div className="text-[12px] font-bold text-foreground/80 uppercase tracking-wide">
                                    {phone.label}
                                  </div>
                                  {/* Número do telefone em negrito */}
                                  <div className="text-[13px] text-foreground/75 mt-0.5 font-bold">
                                    {phone.number}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {tagInfo.whatsapp && (
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-md bg-green-50 flex-shrink-0">
                              {/* Ícone de WhatsApp em negrito */}
                              <MessageCircle className="h-4 w-4 text-green-600 font-bold" />
                            </div>
                            <div className="flex-1 min-w-0">
                              {/* Label do WhatsApp em negrito */}
                              <div className="text-[12px] font-bold text-foreground/80 uppercase tracking-wide">
                                WhatsApp Geral
                              </div>
                              {/* Número do WhatsApp em negrito */}
                              <div className="text-[13px] text-foreground/75 mt-0.5 font-bold">
                                {tagInfo.whatsapp}
                              </div>
                            </div>
                          </div>
                        )}

                        {tagInfo.contacts && tagInfo.contacts.length > 0 && (
                          <div className="space-y-0 pt-0.5">
                            {tagInfo.contacts.map((contact, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 py-2.5 border-t first:border-t-0 border-border/30"
                              >
                                <div className="mt-0.5 p-1.5 rounded-md bg-primary/5 flex-shrink-0">
                                  {/* Ícone de contato em negrito */}
                                  <Phone className="h-4 w-4 text-primary font-bold" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  {/* Nome do contato em negrito */}
                                  <div className="text-[13px] font-bold text-foreground/85">
                                    {contact.name}
                                  </div>
                                  {/* Informações do contato em negrito */}
                                  <div className="text-[12px] text-foreground/65 mt-0.5 font-bold">
                                    {contact.phone} <span className="text-foreground/50 font-bold">|</span> Ramal: {contact.ramal}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="relative bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all text-primary-foreground font-bold"
                onClick={onNotificationClick}
              >
                <Bell className="h-5 w-5 text-primary-foreground font-bold" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white border-2 border-primary">
                    {notificationCount}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all text-primary-foreground font-bold"
                onClick={signOut}
                title={user?.email || 'Sair'}
              >
                <LogOut className="h-5 w-5 text-primary-foreground font-bold" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {editingTag && (
        <HeaderTagModal
          open={!!editingTag}
          onClose={() => setEditingTag(null)}
          onSave={handleSaveTag}
          tagInfo={editingTag}
        />
      )}
    </>
  );
};