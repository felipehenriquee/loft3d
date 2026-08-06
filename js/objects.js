export class Objetos{
    armario ={
        chave: "armario",
        nome: "Armário",
        local: import.meta.env.VITE_ARMARIO_GLB_URL,
        colocarCima: false,
        colocarDireita: true,
        colocarEsquerda: true,
        tipo: "cima",
        tamanhox: 1,
        tamanhoy: 1,
        botao: null,
        movel: "armario",
        nomeMovel: "Armários",
        img: import.meta.env.VITE_ARMARIO_IMG_URL
    }
    balcao ={
        chave: "balcao",
        nome: "Balcão",
        local: import.meta.env.VITE_BALCAO_GLB_URL,
        colocarCima: true,
        colocarDireita: true,
        colocarEsquerda: true,
        tipo: "chao",
        tamanhox: 1,
        tamanhoy: 1,
        botao: null,
        movel: "balcao",
        nomeMovel: "Balcões",
        img: import.meta.env.VITE_BALCAO_IMG_URL
    }
    balcaoGrande ={
        chave: "balcaoGrande",
        nome: "Balcão Grande",
        local: import.meta.env.VITE_BALCAO_GRANDE_GLB_URL,
        colocarCima: true,
        colocarDireita: true,
        colocarEsquerda: true,
        tipo: "chao",
        tamanhox: 2,
        tamanhoy: 1,
        botao: null,
        movel: "balcao",
        nomeMovel: "Balcões",
        img: import.meta.env.VITE_BALCAO_GRANDE_IMG_URL
    }
    paneleiro = {
        chave: "paneleiro",
        nome: "Paneleiro",
        local: import.meta.env.VITE_PANELEIRO_GLB_URL,
        colocarCima: false,
        colocarDireita: true,
        colocarEsquerda: true,
        tipo: "chao",
        tamanhox: 1,
        tamanhoy: 2,
        botao: null,
        movel: "paneleiro",
        nomeMovel: "Paneleiros",
        img: import.meta.env.VITE_PANELEIRO_IMG_URL
    }

    armarioGrande ={
        chave: "armarioGrande",
        nome: "Armário Grande",
        local: import.meta.env.VITE_ARMARIO_GRANDE_GLB_URL,
        colocarCima: true,
        colocarDireita: true,
        colocarEsquerda: true,
        tipo: "cima",
        tamanhox: 2,
        tamanhoy: 1,
        botao: null,
        movel: "armario",
        nomeMovel: "Armários",
        img: import.meta.env.VITE_ARMARIO_GRANDE_IMG_URL
    }
    todosObjetos = [
        this.armario, this.armarioGrande, this.balcao, this.balcaoGrande, this.paneleiro
    ]
}
