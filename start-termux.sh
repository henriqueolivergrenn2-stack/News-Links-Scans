#!/bin/bash
# Script para iniciar no Termux automaticamente

echo "📚 Iniciando Manhwa Links..."

# Verificar se está no Termux
if [ -n "$TERMUX_VERSION" ]; then
    echo "✓ Termux detectado"
fi

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "⚠️ Python não encontrado. Instalando..."
    pkg update -y
    pkg install python -y
fi

# Iniciar servidor
cd "$(dirname "$0")"
echo "🚀 Iniciando servidor..."
python3 server.py
