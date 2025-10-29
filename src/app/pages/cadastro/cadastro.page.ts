import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, createUserWithEmailAndPassword, updateProfile, fetchSignInMethodsForEmail } from 'firebase/auth';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: false,
})
export class CadastroPage {
  nome: string = '';
  email: string = '';
  senha: string = '';
  checkSaude: boolean = false;
  msgCadastro: string = '';
  msgColor: string = 'red';

  constructor(private router: Router) {}

  async cadastrar() {
    const auth = getAuth();

    // 🔹 Validação de campos
    if (!this.nome || !this.email || !this.senha) {
      this.msgCadastro = 'Preencha todos os campos corretamente!';
      this.msgColor = 'red';
      return;
    }

    if (!this.checkSaude) {
      this.msgCadastro = 'Você deve confirmar que está apto(a) para realizar os treinos.';
      this.msgColor = 'red';
      return;
    }

    if (!this.email.toLowerCase().endsWith('@gmail.com')) {
      this.msgCadastro = 'Use um e-mail do Gmail.';
      this.msgColor = 'red';
      return;
    }

    try {
      // 🔹 Verifica se o email já está registrado
      const methods = await fetchSignInMethodsForEmail(auth, this.email);
      if (methods.length > 0) {
        this.msgCadastro = 'Este e-mail já está registrado!';
        this.msgColor = 'red';
        return;
      }

      // 🔹 Cria o usuário
      const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.senha);
      await updateProfile(userCredential.user, { displayName: this.nome });

      this.msgCadastro = 'Cadastro realizado! Redirecionando...';
      this.msgColor = 'white';

      // 🔹 Limpa os campos
      this.nome = '';
      this.email = '';
      this.senha = '';
      this.checkSaude = false;

      // 🔹 Redireciona após 1 segundo
      setTimeout(() => {
        this.router.navigate(['/cadastro2']);
      }, 1000);

    } catch (error: any) {
      // 🔹 Trata erros específicos do Firebase
      this.msgColor = 'red';
      switch (error.code) {
        case 'auth/invalid-email':
          this.msgCadastro = 'Email inválido!';
          break;
        case 'auth/weak-password':
          this.msgCadastro = 'A senha deve ter no mínimo 6 caracteres!';
          break;
        case 'auth/email-already-in-use':
          this.msgCadastro = 'Email registrado já está em uso!';
          break;
        default:
          this.msgCadastro = 'Erro: ' + error.message;
      }
    }
  }
}
