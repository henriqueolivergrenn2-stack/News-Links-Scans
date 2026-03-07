# 📚 Manhwa Links

Site otimizado para divulgação de Scans e Fontes de Manhwa/Mangá.

## ✨ Funcionalidades

- 🔍 **Busca rápida** - Procure por nome ou URL
- 🌍 **Filtro por idioma** - PT-BR, PT, EN, ES, etc.
- ✅ **Verificação de status** - Online/Offline
- 🔞 **Filtro NSFW** - Mostrar/ocultar conteúdo adulto
- 🚀 **Otimizado para Android** - Rápido e sem lag
- 📱 **Design responsivo** - Perfeito para mobile

## 🚀 Como usar no Termux (Android)

### Método 1: Servidor Python (Recomendado)

```bash
# 1. Entre na pasta
cd manhwa-links

# 2. Execute o servidor
python3 server.py

# 3. Acesse no navegador
# http://localhost:8080
```

### Método 2: Script automático

```bash
# Dar permissão e executar
chmod +x start-termux.sh
./start-termux.sh
```

### Método 3: Abrir diretamente

```bash
# No Termux, abra o arquivo diretamente
termux-open index.html
```

### Método 4: Python HTTP simples

```bash
cd manhwa-links
python3 -m http.server 8080
```

## 📦 Instalação completa no Termux

```bash
# 1. Atualizar pacotes
pkg update && pkg upgrade -y

# 2. Instalar Python
pkg install python -y

# 3. Baixar o projeto
# (copie a pasta manhwa-links para o Termux)

# 4. Executar
cd manhwa-links
python3 server.py
```

## 🎨 Otimizações feitas

- ✅ Remoção de links duplicados
- ✅ Renderização em lotes (sem lag)
- ✅ Debounce na busca
- ✅ Cache de status
- ✅ Código minificado
- ✅ Imagens otimizadas
- ✅ Sem dependências externas

## 🌐 Idiomas disponíveis

- 🇧🇷 **pt-BR** - Português (Brasil)
- 🇵🇹 **pt** - Português
- 🇺🇸 **en** - Inglês
- 🇪🇸 **es** - Espanhol
- 🇫🇷 **fr** - Francês
- 🇯🇵 **ja** - Japonês
- 🇰🇷 **ko** - Coreano
- E mais...

## 📁 Arquivos

- `index.html` - Site principal
- `server.py` - Servidor Python
- `start-termux.sh` - Script de inicialização
- `README.md` - Este arquivo

---

**Dica:** Para usar no Termux, apenas execute `python3 server.py` e acesse pelo navegador!
