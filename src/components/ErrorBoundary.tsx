
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
                    <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Algo deu errado</h1>
                    <p className="text-muted-foreground mb-4 text-center max-w-md">
                        Ocorreu um erro inesperado na aplicação.
                    </p>
                    <div className="bg-muted p-4 rounded-md mb-6 max-w-2xl w-full overflow-auto text-xs font-mono border border-border">
                        <p className="font-bold text-red-500 mb-2">{this.state.error?.toString()}</p>
                        <pre className="whitespace-pre-wrap text-muted-foreground">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={() => window.location.reload()}>
                            Recarregar Página
                        </Button>
                        <Button variant="outline" onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}>
                            Limpar Cache e Recarregar
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
