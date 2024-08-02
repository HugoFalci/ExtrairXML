/**
Linha de Raciínio para Criar o Script de Extração e Relatório de Tags de XML

1 - Importação dos Módulos Necessários
Primeiro, você precisa importar os módulos necessários para o seu script. Utilizamos o módulo fs para ler arquivos do sistema, 
o módulo path para manipulação de caminhos de arquivos e o módulo xml2js para converter o conteúdo XML em um formato JSON manipulável.

2 - Definição dos Arquivos e Tags
Especifique quais arquivos XML você deseja processar e quais tags você quer extrair. No exemplo, definimos uma lista de arquivos XML 
e as tags de interesse como cd_corretor, nm_usuario, e cd_usuario.

3 - Criação da Função de Busca de Tags
A função procurarTags é projetada para percorrer o objeto JSON resultante da conversão do XML. Ela procura por todas as ocorrências de
uma tag específica e coleta todos os valores associados a essa tag. Essa função é recursiva, o que significa que ela pode explorar objetos aninhados dentro do JSON.

4 - Função para Extrair Tags
A função extrairTags é responsável por ler o arquivo XML, converter seu conteúdo para JSON, e então usar a função procurarTags para
encontrar e coletar todos os valores das tags especificadas. Ela usa promessas (Promise) para lidar com operações assíncronas, 
como a leitura do arquivo e a conversão de XML para JSON.

5 - Geração do Relatório
A função gerarRelatorio chama extrairTags para cada arquivo XML especificado, coleta os resultados e os organiza em um relatório. 
Durante essa etapa, o código também lida com a possibilidade de erros e exibe mensagens apropriadas caso algo dê errado.

6 - Alinhamento dos Dados no Relatório
Para garantir que os dados sejam exibidos de forma alinhada e clara, a função gerarRelatorio calcula o comprimento máximo das listas de 
valores para as tags e então itera até esse comprimento máximo. Se uma lista de valores for mais curta do que o comprimento máximo, 
a função usa um valor padrão (N/A) para preencher as lacunas.

7 - Execução do Script
Finalmente, o script chama a função gerarRelatorio para gerar e exibir o relatório completo. Isso inclui a leitura dos arquivos, 
extração das tags e exibição dos resultados alinhados no console.
*/


// Importa os módulos necessários
const fs = require('fs'); // Módulo para manipulação de arquivos
const path = require('path'); // Módulo para manipulação de caminhos de arquivos
const xml2js = require('xml2js'); // Módulo para conversão de XML para JSON

// Define os arquivos XML a serem processados e as tags a serem extraídas
const arquivos = ['usuarios-554-1721673238.xml'];
const tags = ['cd_corretor', 'nm_usuario', 'cd_usuario'];

// Função para procurar todas as ocorrências de uma tag específica em um objeto JSON
function procurarTags(obj, tag, resultados = []) {
    if (typeof obj !== 'object') return; // Se o objeto não for um objeto, retorna
    for (let key in obj) { // Itera sobre cada chave no objeto
        if (key === tag) { // Se a chave é a tag que procuramos
            if (Array.isArray(obj[key])) { // Se o valor é um array
                resultados.push(...obj[key]); // Adiciona todos os elementos do array aos resultados
            } else {
                resultados.push(obj[key]); // Caso contrário, adiciona o valor diretamente
            }
        }
        if (typeof obj[key] === 'object') { // Se o valor é um objeto, faz a busca recursiva
            procurarTags(obj[key], tag, resultados);
        }
    }
    return resultados; // Retorna a lista de valores encontrados
}

// Função para extrair as tags dos arquivos XML
function extrairTags(arquivo, tags) {
    return new Promise((resolve, reject) => {
        console.log(`Lendo o arquivo: ${arquivo}`); // Exibe o nome do arquivo sendo lido
        fs.readFile(arquivo, 'utf8', (err, data) => { // Lê o arquivo XML
            if (err) { // Se ocorrer um erro ao ler o arquivo
                reject(`Erro ao ler o arquivo ${arquivo}: ${err.message}`); // Rejeita a promessa com uma mensagem de erro
                return;
            }
            
            // Converte o conteúdo XML para um objeto JSON
            xml2js.parseString(data, (err, result) => {
                if (err) { // Se ocorrer um erro ao converter XML para JSON
                    reject(`Erro ao analisar o arquivo ${arquivo}: ${err.message}`); // Rejeita a promessa com uma mensagem de erro
                    return;
                }

                let resultados = {}; // Cria um objeto para armazenar os resultados das tags
                tags.forEach(tag => { // Para cada tag que precisamos buscar
                    resultados[tag] = procurarTags(result, tag).map(v => v.trim()).filter(v => v); // Procura a tag e limpa os valores
                });
                
                resolve(resultados); // Resolve a promessa com os resultados encontrados
            });
        });
    });
}

// Função para gerar o relatório final
async function gerarRelatorio() {
    let relatorio = {}; // Cria um objeto para armazenar o relatório

    for (let arquivo of arquivos) { // Para cada arquivo na lista de arquivos
        try {
            let caminhoArquivo = path.join(__dirname, arquivo); // Cria o caminho completo para o arquivo
            let resultadoTags = await extrairTags(caminhoArquivo, tags); // Extrai as tags do arquivo
            relatorio[arquivo] = resultadoTags; // Adiciona os resultados ao relatório
        } catch (error) { // Se ocorrer um erro ao processar o arquivo
            console.error(error); // Exibe a mensagem de erro
        }
    }

    // Exibe o relatório de tags
    console.log("Relatório de Tags:");
    for (let [arquivo, tags] of Object.entries(relatorio)) { // Itera sobre cada arquivo e seus resultados
        console.log(`\nArquivo: ${arquivo}`);
        const { cd_corretor = [], nm_usuario = [],  cd_usuario = []} = tags; // Obtém os valores das tags, com arrays vazios como padrão
        const maxLength = Math.max(cd_corretor.length, nm_usuario.length, cd_usuario.length); // Calcula o comprimento máximo entre as listas de valores
        
        for (let i = 0; i < maxLength; i++) { // Itera até o comprimento máximo
            const corretor = cd_corretor[i] || 'N/A'; // Obtém o valor de cd_corretor, ou 'N/A' se não houver
            const usuario = nm_usuario[i] || 'N/A'; // Obtém o valor de nm_usuario, ou 'N/A' se não houver
            const codigo = cd_usuario[i] || 'N/A'; // Obtém o valor de codigo, ou 'N/A' se não houver
            console.log(`${corretor}, ${usuario}, ${codigo}`); // Exibe o valor das tags alinhados
        }
    }
}

// Chama a função para gerar o relatório
gerarRelatorio();
