import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-cadastro2',
  templateUrl: './cadastro2.page.html',
  styleUrls: ['./cadastro2.page.scss'],
  standalone: false,
})
export class Cadastro2Page implements OnInit {
  // ===============================
  // 🔹 VARIÁVEIS DE ESTADO
  // ===============================
  userName: string = 'Carregando...';
  altura: number | null = null;
  peso: number | null = null;
  idade: number | null = null;
  objetivo: string = '';
  genero: string = '';
  descricaoObjetivo: string = '';

  // Modal customizado
  showAlert: boolean = false;
  alertMessage: string = '';
  alertCallback: (() => void) | null = null;

  // Opções do select "objetivo"
  objetivos: string[] = [
    'Resistência',
    'Força',
    'Crescimento',
    'Funcional',
    'Aeróbico',
    'Mobilidade'
  ];

  // Descrições dos objetivos
  descricoes: any = {
    'Resistência': 'Resistência: Focado em aumentar a capacidade muscular e cardiovascular, melhorando a resistência física geral.',
    'Força': 'Força: Voltado para o ganho de força e potência muscular, com exercícios de alta intensidade e carga progressiva.',
    'Crescimento': 'Crescimento: Indicado para quem busca hipertrofia e aumento do volume muscular.',
    'Funcional': 'Funcional: Trabalha movimentos naturais do corpo, melhorando equilíbrio, coordenação e estabilidade.',
    'Aeróbico': 'Aeróbico: Ideal para quem deseja melhorar o condicionamento físico e queimar gordura corporal.',
    'Mobilidade': 'Mobilidade: Ajuda a aumentar a amplitude dos movimentos, flexibilidade e prevenir lesões.'
  };

  constructor(private router: Router) {}

  // ===============================
  // 🔹 AO INICIAR A PÁGINA
  // ===============================
  ngOnInit() {
    const auth = getAuth();

    // Verifica se o usuário está logado
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.userName = user.displayName || 'Usuário sem nome';
      } else {
        // Se não estiver logado, redireciona para login
        this.router.navigate(['/login']);
      }
    });
  }

  // ===============================
  // 🔹 ATUALIZA A DESCRIÇÃO DO OBJETIVO
  // ===============================
  atualizarDescricao() {
    this.descricaoObjetivo = this.descricoes[this.objetivo] || '';
  }

  // ===============================
  // 🔹 SALVAR DADOS NO FIRESTORE
  // ===============================
  async salvarDados() {
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (!user) {
      this.mostrarAlerta('Usuário não autenticado.');
      return;
    }

    // Validação básica
    if (!this.altura || !this.peso || !this.idade || !this.objetivo || !this.genero) {
      this.mostrarAlerta('Preencha todos os campos corretamente!');
      return;
    }

    try {
      await setDoc(doc(db, 'usuarios', user.uid), {
        altura: this.altura,
        peso: this.peso,
        idade: this.idade,
        objetivo: this.objetivo,
        genero: this.genero
      });

      this.mostrarAlerta('Dados salvos com sucesso!', () => {
        this.router.navigate(['/cadastro3']);
      });
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      this.mostrarAlerta('Erro ao salvar dados. Tente novamente.');
    }
  }

  // ===============================
  // 🔹 MODAL PERSONALIZADO
  // ===============================
  mostrarAlerta(mensagem: string, callback?: () => void) {
    this.alertMessage = mensagem;
    this.showAlert = true;
    this.alertCallback = callback || null;
  }

  fecharAlerta() {
    this.showAlert = false;
    if (typeof this.alertCallback === 'function') {
      this.alertCallback();
      this.alertCallback = null;
    }
  }

  removerSinalNegativo(event: any) {
  const input = event.target;
  if (input && input.value && input.value.includes('-')) {
    input.value = input.value.replace('-', '');
  }
}

validarInput(event: any) {
  const input = event.target;
  if (!input || !input.value) return;

  // Remove sinal de negativo
  input.value = input.value.replace('-', '');

  // Mantém apenas 3 dígitos
  if (input.value.length > 3) {
    input.value = input.value.slice(0, 3);
  }
}

}
