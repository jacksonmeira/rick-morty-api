# Rick/Morty API

Uma aplicação web para explorar personagens do universo **Rick and Morty**. O projeto consome a Rick and Morty API e apresenta os dados em uma interface responsiva, com tema escuro e detalhes em verde neon.

## Funcionalidades

- Listagem de personagens em cards com imagem, espécie, status, gênero e localização.
- Busca por nome com atraso controlado para evitar chamadas a cada tecla.
- Filtros por status, espécie e gênero.
- Paginação com navegação por páginas próximas e controles anterior/próxima.
- Modal de detalhes com origem, localização e episódios em que o personagem aparece.
- Estados de carregamento, erro e busca sem resultados.
- Cancelamento de requisições obsoletas e novas tentativas em falhas temporárias de conexão.
- Layout adaptado para desktop e dispositivos móveis.

## Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS 4
- Lucide React
- Rick and Morty API

## Executar localmente

**Requisitos:** Node.js 18 ou superior e npm.

```bash
git clone https://github.com/jacksonmeira/ram-API.git
cd ram-API
npm install
npm run dev
```

O Vite exibirá no terminal o endereço local para abrir no navegador.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Verifica os tipos TypeScript e gera a versão de produção em `dist/`. |
| `npm run preview` | Abre uma prévia local da versão de produção. |

## Integração com a API

Os dados são consultados diretamente da [Rick and Morty API](https://rickandmortyapi.com/documentation). A aplicação usa os parâmetros de busca, filtros e página nos endpoints, e consulta os episódios ao abrir o perfil de um personagem.

## Estrutura principal

```text
src/
├── assets/       # Logotipo
├── api.ts        # Tipos e chamadas à API
├── App.tsx       # Interface, catálogo, filtros e modal
├── index.css     # Estilos e responsividade
└── main.tsx      # Entrada da aplicação React
```

## Sobre

Projeto de portfólio desenvolvido para praticar consumo de APIs REST, componentes React, tipagem com TypeScript e construção de interfaces responsivas.
