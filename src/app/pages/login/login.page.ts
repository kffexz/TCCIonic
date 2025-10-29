import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email: string = '';
  senha: string = '';
  msgLogin: string = '';
  msgColor: string = 'red';

  private auth = getAuth(initializeApp(environment.firebaseConfig));

  constructor(private router: Router) {}

  login() {
    if (!this.email || !this.senha) {
      this.msgColor = 'red';
      this.msgLogin = "Preencha email e senha corretamente!";
      return;
    }

    signInWithEmailAndPassword(this.auth, this.email, this.senha)
      .then(userCredential => {
        const user = userCredential.user;
        this.msgColor = 'white';
        this.msgLogin = `Login realizado! Bem-vindo, ${user.displayName || "usuário"}!`;

        setTimeout(() => {
          this.router.navigate(['/home']); // redireciona para a home
        }, 1500);
      })
      .catch(error => {
        this.msgColor = 'red';
        if (error.code === 'auth/user-not-found') this.msgLogin = "Usuário não encontrado.";
        else if (error.code === 'auth/wrong-password') this.msgLogin = "Senha incorreta!";
        else if (error.code === 'auth/invalid-login-credentials') this.msgLogin = "Email ou senha inválidos.";
        else if (error.code === 'auth/invalid-email') this.msgLogin = "Email inválido! Use um Gmail válido.";
        else this.msgLogin = "Erro: " + error.message;
      });
  }

  recuperarSenha() {
    if (!this.email) {
      this.msgColor = 'red';
      this.msgLogin = "Digite seu e-mail de login para recuperar a senha.";
      return;
    }

    sendPasswordResetEmail(this.auth, this.email)
      .then(() => {
        this.msgColor = '#00aea8';
        this.msgLogin = "Link de recuperação enviado para o seu e-mail!";
      })
      .catch(error => {
        this.msgColor = 'red';
        if (error.code === 'auth/user-not-found') {
          this.msgLogin = "Nenhuma conta encontrada com este e-mail.";
        } else if (error.code === 'auth/invalid-email') {
          this.msgLogin = "E-mail inválido. Por favor, verifique o formato.";
        } else {
          this.msgLogin = "Erro ao enviar link: " + error.message;
        }
      });
  }
}
