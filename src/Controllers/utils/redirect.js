// Função criada para fazer o redirecionamento de páginas quando clicado algum botão especifico
// recebe como parametro o botão que ouvirá o evento de click do usuário e a url da API que deve ser chamada quando o click acontecer
export default function Redirect(button, url) {
  button.addEventListener("click", () => {
    window.location.href = url
  })
}