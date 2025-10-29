import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-edit-perfil',
  templateUrl: './edit-perfil.page.html',
  styleUrls: ['./edit-perfil.page.scss'],
  standalone: false,
})
export class EditPerfilPage implements OnInit {
  auth = getAuth();
  db = getFirestore();

  userName: string = '';
  cadNome: string = '';
  altura: number | null = null;
  peso: number | null = null;
  idade: number | null = null;
  objetivo: string = '';
  genero: string = '';
  descricaoObjetivo: string = '';

  showAlert = false;
  alertMessage = '';

  descricoes: any = {
    'Resistência': 'Resistência: Focado em aumentar a capacidade muscular e cardiovascular, melhorando a resistência física geral.',
    'Força': 'Força: Voltado para o ganho de força e potência muscular, com exercícios de alta intensidade e carga progressiva.',
    'Crescimento': 'Crescimento: Indicado para quem busca hipertrofia e aumento do volume muscular.',
    'Funcional': 'Funcional: Trabalha movimentos naturais do corpo, melhorando equilíbrio, coordenação e estabilidade.',
    'Aeróbico': 'Aeróbico: Ideal para quem deseja melhorar o condicionamento físico e queimar gordura corporal.',
    'Mobilidade': 'Mobilidade: Ajuda a aumentar a amplitude dos movimentos, flexibilidade e prevenir lesões.'
  };

  constructor(private router: Router) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.userName = user.displayName || 'Sem nome';
      const userDoc = await getDoc(doc(this.db, 'usuarios', user.uid));

      if (userDoc.exists()) {
        const dados = userDoc.data() as any;
        this.cadNome = user.displayName || '';
        this.altura = dados.altura || null;
        this.peso = dados.peso || null;
        this.idade = dados.idade || null;
        this.objetivo = dados.objetivo || '';
        this.genero = dados.genero || '';
        this.descricaoObjetivo = this.descricoes[this.objetivo] || '';
      }
    });
  }

  atualizarDescricao() {
    this.descricaoObjetivo = this.descricoes[this.objetivo] || '';
  }

  bloquearTeclasInvalidas(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }

  async salvarDados() {
    const user = this.auth.currentUser;

    if (!this.cadNome.trim()) {
      this.showCustomAlert('Informe o nome antes de salvar.');
      return;
    }

    if (!user) {
      this.showCustomAlert('Usuário não autenticado.');
      return;
    }

    try {
      await updateDoc(doc(this.db, 'usuarios', user.uid), {
        cadNome: this.cadNome,
        altura: this.altura,
        peso: this.peso,
        idade: this.idade,
        objetivo: this.objetivo,
        genero: this.genero,
      });

      await updateProfile(user, { displayName: this.cadNome });
      this.userName = this.cadNome;

      this.showCustomAlert('Dados salvos com sucesso!', () => {
        this.router.navigate(['/perfil']);
      });
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      this.showCustomAlert('Erro ao salvar dados. Tente novamente.');
    }
  }

  showCustomAlert(message: string, callback?: () => void) {
    this.alertMessage = message;
    this.showAlert = true;

    if (callback) {
      const close = this.closeCustomAlert.bind(this);
      this.closeCustomAlert = () => {
        close();
        callback();
      };
    }
  }

  closeCustomAlert() {
    this.showAlert = false;
  }
}
