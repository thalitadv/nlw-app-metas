const { select, input, checkbox } = require('@inquirer/prompts'); // Importa funções do pacote @inquirer/prompts
const fs = require("fs").promises; // Importa a API de promessas do fs para operações assíncronas com arquivos

let mensagem = "Bem-vindo(a) ao App de Metas"; // Mensagem de boas-vindas
let metas; // Array para armazenar as metas

// Função para carregar metas do arquivo metas.json
const carregarMetas = async () => {
    try {
        const dados = await fs.readFile("metas.json", "utf-8");
        metas = JSON.parse(dados); // Converte JSON para array de metas
    } catch (erro) {
        metas = []; // Se o arquivo não existir, inicia um array vazio
    }
}

// Função para salvar metas no arquivo metas.json
const salvarMetas = async () => {
    await fs.writeFile("metas.json", JSON.stringify(metas, null, 2)); // Salva metas como JSON formatado
}

// Função para cadastrar uma nova meta
const cadastrarMeta = async () => {
    const meta = await input({ message: "Digite uma meta: " });
    
    if (meta.length == 0) {
        mensagem = "Nenhuma meta adicionada.";
        return;
    }

    metas.push({ value: meta, checked: false }); // Adiciona a nova meta ao array
    mensagem = "Meta cadastrada com sucesso!";
}

// Função para listar metas e permitir seleção
const listarMetas = async () => {
    if (metas.length == 0) {
        mensagem = "Não existem metas!";
        return;
    }

    const respostas = await checkbox({
        message: "Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o Enter para finalizar essa etapa.",
        choices: [...metas], 
        instructions: false
    });

    metas.forEach((m) => { m.checked = false; }); // Desmarca todas as metas

    if (respostas.length == 0) {
        mensagem = "Nenhuma meta selecionada!";
        return;
    }

    respostas.forEach((resposta) => {
        const meta = metas.find((m) => m.value == resposta);
        meta.checked = true; // Marca as metas selecionadas
    });

    mensagem = "Meta(s) marcada(s) como concluída(s)";
}

// Função para mostrar metas realizadas
const metasRealizadas = async () => {
    if (metas.length == 0) {
        mensagem = "Não existem metas!";
        return;
    }

    const realizadas = metas.filter((meta) => meta.checked); // Filtra metas concluídas
    
    if (realizadas.length == 0) {
        mensagem = "Nenhuma meta realizada.";
        return;
    }

    await select({
        message: "Metas realizadas: " + realizadas.length,
        choices: [...realizadas]
    });
}

// Função para mostrar metas abertas (não concluídas)
const metasAbertas = async () => {
    if (metas.length == 0) {
        mensagem = "Não existem metas!";
        return;
    }

    const abertas = metas.filter((meta) => !meta.checked); // Filtra metas não concluídas
    
    if (abertas.length == 0) {
        mensagem = "Não existem metas abertas!";
        return;
    }

    await select({
        message: "Metas Abertas: " + abertas.length,
        choices: [...abertas]
    });
}

// Função para deletar metas
const deletarMetas = async () => {
    if (metas.length == 0) {
        mensagem = "Não existem metas!";
        return;
    }
    
    const metasDesmarcadas = metas.map((meta) => ({ value: meta.value, checked: false })); // Cria uma cópia das metas desmarcadas

    const itensADeletar = await checkbox({
        message: "Selecione item para deletar",
        choices: [...metasDesmarcadas], 
        instructions: false
    });

    if (itensADeletar.length == 0) {
        mensagem = "Nenhum item para deletar.";
        return;
    }

    itensADeletar.forEach((item) => {
        metas = metas.filter((meta) => meta.value != item); // Remove metas selecionadas para deletar
    });

    mensagem = "Meta(s) deletada(s) com sucesso!";
}

// Função para mostrar mensagens para o usuário
const mostrarMensagem = () => {
    console.clear(); // Limpa o console

    if (mensagem != "") {
        console.log(mensagem);
        console.log("");
        mensagem = ""; // Limpa a mensagem após exibição
    }
}

// Função principal para executar o menu de opções
const start = async () => {
    await carregarMetas(); // Carrega metas do arquivo

    while (true) { // Loop do menu principal
        mostrarMensagem(); // Exibe mensagens para o usuário
        await salvarMetas(); // Salva metas no arquivo

        // Exibe menu de opções e aguarda a escolha do usuário
        const opcao = await select({
            message: "Menu >",
            choices: [
                { name: "Cadastrar meta", value: "cadastrar" },
                { name: "Listar metas", value: "listar" },
                { name: "Metas realizadas", value: "realizadas" },
                { name: "Metas abertas", value: "abertas" },
                { name: "Deletar metas", value: "deletar" },
                { name: "Sair", value: "sair" }
            ]
        });

        // Executa a ação correspondente à opção escolhida
        switch (opcao) {
            case "cadastrar":
                await cadastrarMeta();
                break;
            case "listar":
                await listarMetas();
                break;
            case "realizadas":
                await metasRealizadas();
                break;
            case "abertas":
                await metasAbertas();
                break;
            case "deletar":
                await deletarMetas();
                break;
            case "sair":
                console.log("Até a próxima!");
                return; // Sai do loop e encerra o programa
        }
    }
}

start(); // Inicia o aplicativo