import React from "react";
import { Button } from "./button";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function Unauthorized() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in-up">
            <div 
                className="relative max-w-lg w-full rounded-3xl p-8 md:p-10 text-center overflow-hidden"
                style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    boxShadow: '0 20px 40px -15px rgba(239,68,68,0.1), 0 0 0 1px rgba(255,255,255,0.5) inset'
                }}
            >
                {/* Background decorative elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-8 group">
                        <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-30 group-hover:opacity-50 transition-opacity"></div>
                        <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-50 to-red-100/50 rounded-[2rem] border-2 border-red-100 shadow-xl shadow-red-500/10 rotate-3 transition-transform duration-300 group-hover:rotate-6">
                            <Lock className="w-10 h-10 text-red-500" strokeWidth={2.5} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-gray-100">
                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                        </div>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 tracking-tight">
                        {t("unauthorized.title", "Accès Non Autorisé")}
                    </h1>
                    
                    <p className="text-[15px] text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
                        {t("unauthorized.description", "Vous n'avez pas les droits requis pour accéder à cette ressource. Si vous pensez qu'il s'agit d'une erreur, veuillez vous rapprocher de votre administrateur système.")}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                        <Button 
                            onClick={() => router.history.back()} 
                            variant="outline" 
                            className="w-full sm:w-auto gap-2 rounded-xl h-11 px-6 border-gray-200 hover:bg-gray-50 font-semibold text-gray-600 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t("unauthorized.back", "Retourner")}
                        </Button>
                        <Button 
                            onClick={() => router.navigate({ to: '/' })} 
                            className="w-full sm:w-auto gap-2 rounded-xl h-11 px-6 shadow-md transition-all hover:shadow-lg font-semibold"
                            style={{ background: 'linear-gradient(135deg, #ff4a0a 0%, #8f2b05 100%)', color: 'white' }}
                        >
                            {t("unauthorized.dashboard", "Aller au Tableau de bord")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
