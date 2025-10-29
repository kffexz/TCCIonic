import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-cadastro3',
  templateUrl: './cadastro3.page.html',
  styleUrls: ['./cadastro3.page.scss'],
  standalone:false,
})
export class Cadastro3Page implements OnInit {

  // ✅ Lista de equipamentos disponíveis
  equipamentos = [
    { nome: 'Halteres', img: 'assets/img/halteres.png' },
    { nome: 'Barra', img: 'assets/img/barra.png' },
    { nome: 'Elástico', img: 'assets/img/elastico.png' },
    { nome: 'Kettlebell', img: 'assets/img/kettlebell.png' },
    { nome: 'Corda', img: 'assets/img/corda.png' },
    { nome: 'Esteira', img: 'assets/img/esteira.png' },
    { nome: 'Corda naval', img: 'assets/img/cordanaval.jpeg' },
    { nome: 'Corpo', img: 'assets/img/sem_equipamento.jpg' },
  ];

  // ✅ Lista com os equipamentos selecionados
  equipSelecionados: string[] = [];

  // ✅ Controle do modal
  showAlert: boolean = false;
  alertMessage: string = '';

  // ✅ Instâncias do Firebase
  auth = getAuth();
  db = getFirestore();

  constructor(private router: Router) {}

  ngOnInit() {
    // ✅ Verifica se o usuário está autenticado
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        // Se não estiver logado, redireciona para login
        this.router.navigate(['/login']);
      }
    });
  }

  // ✅ Alterna a seleção dos equipamentos
  toggleEquipamento(nome: string) {
    const index = this.equipSelecionados.indexOf(nome);
    if (index >= 0) {
      // Se já estiver selecionado, remove
      this.equipSelecionados.splice(index, 1);
    } else {
      // Caso contrário, adiciona
      this.equipSelecionados.push(nome);
    }
  }

  // ✅ Salva os equipamentos no Firestore
  async salvarEquipamentos() {
    const user = this.auth.currentUser;

      // ✅ Validação: precisa selecionar pelo menos um equipamento
  if (this.equipSelecionados.length === 0) {
    this.showCustomAlert('Selecione pelo menos um equipamento antes de continuar.');
    return; // interrompe a função
  }
  
    if (!user) {
      this.showCustomAlert('Usuário não logado.');
      return;
    }

    try {
      // Atualiza o documento do usuário com os equipamentos selecionados
      await updateDoc(doc(this.db, 'usuarios', user.uid), {
        equipamentos: this.equipSelecionados,
      });

      // Mostra mensagem de sucesso
      this.showCustomAlert('Equipamentos salvos com sucesso!', () => {
        this.router.navigate(['/home']);
      });

    } catch (error) {
      console.error('Erro ao salvar equipamentos:', error);
      this.showCustomAlert('Erro ao salvar equipamentos.');
    }
  }

  // ✅ Exibe o modal de alerta
  showCustomAlert(message: string, callback?: () => void) {
    this.alertMessage = message;
    this.showAlert = true;

    // Callback opcional após fechar o modal
    if (callback) {
      const close = this.closeCustomAlert.bind(this);
      this.closeCustomAlert = () => {
        close();
        callback();
      };
    }
  }

  // ✅ Fecha o modal
  closeCustomAlert() {
    this.showAlert = false;
  }
}
