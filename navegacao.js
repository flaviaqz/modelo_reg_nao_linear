document.addEventListener("DOMContentLoaded", function () {

  /* =========================================================
     CONFIGURAÇÃO
     ========================================================= */

  const capitulos = Array.from(
    document.querySelectorAll("main.content section.level1")
  );

  const toc = document.querySelector("#TOC");

  if (capitulos.length === 0) return;

  /* Mantém os links de contato dentro da caixa alta, logo abaixo do nome. */
  const linksAutora = document.querySelector(".links-autora");
  const dadosAutora = document.querySelector(
    "#title-block-header .quarto-title-meta > div:first-child .quarto-title-meta-contents"
  );
  if (linksAutora && dadosAutora) {
    dadosAutora.appendChild(linksAutora);
  }



  /* Busca em todos os capítulos, inclusive os que estão ocultos */
  if (toc) {
    const formulario = document.createElement("form");
    formulario.className = "busca-aula";
    formulario.setAttribute("role", "search");

    const campo = document.createElement("input");
    campo.type = "search";
    campo.placeholder = "Pesquisar no documento";
    campo.setAttribute("aria-label", "Pesquisar no documento");
    formulario.appendChild(campo);

    const resultados = document.createElement("div");
    resultados.className = "resultados-busca";
    resultados.setAttribute("aria-live", "polite");

    const tituloToc = toc.querySelector("#toc-title");
    const tituloDocumento = document.createElement("h2");
    tituloDocumento.className = "titulo-indice-documento";
    tituloDocumento.classList.add("titulo-indice-com-pdf");
    tituloDocumento.innerHTML = '<span>Modelos Não Lineares</span><a class="baixar-pdf-indice" href="apostila.pdf" download="apostila.pdf" aria-label="Baixar apostila em PDF" title="Baixar apostila em PDF"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l4 4v6M14 2v5h5M6 12v10h13v-6M3 16h8m-4-4 4 4-4 4"/></svg></a>';

    if (tituloToc) {
      tituloToc.insertAdjacentElement("beforebegin", tituloDocumento);
      tituloToc.insertAdjacentElement("beforebegin", formulario);
      tituloToc.insertAdjacentElement("afterend", resultados);
    } else {
      toc.prepend(resultados);
      toc.prepend(formulario);
      toc.prepend(tituloDocumento);
    }

    function executarBusca() {
      resultados.replaceChildren();

      const termo = normalizar(campo.value);
      if (!termo) {
        resultados.textContent = "Digite uma palavra ou expressão.";
        return;
      }

      const seletores = "h1, h2, h3, h4, p, li, td, th, figcaption, dt, dd";
      const encontrados = [];
      capitulos.forEach(function (capitulo) {
        capitulo.querySelectorAll(seletores).forEach(function (bloco) {
          if (normalizar(bloco.textContent).includes(termo)) {
            encontrados.push({ bloco: bloco, capitulo: capitulo });
          }
        });
      });

      if (encontrados.length === 0) {
        resultados.textContent = "Nenhum resultado encontrado.";
        return;
      }

      const aviso = document.createElement("p");
      aviso.className = "busca-contagem";
      aviso.textContent = encontrados.length + " resultado(s):";
      resultados.appendChild(aviso);

      encontrados.slice(0, 30).forEach(function (item, indice) {
        const link = document.createElement("button");
        link.type = "button";
        link.className = "resultado-busca";
        const trecho = item.bloco.textContent.replace(/\s+/g, " ").trim();
        link.textContent = (obterTitulo(item.capitulo) + " — " + trecho).slice(0, 260);
        link.title = "Abrir este trecho";

        link.addEventListener("click", function () {
          const indiceCapitulo = capitulos.indexOf(item.capitulo);
          if (indiceCapitulo < 0) return;
          if (!item.bloco.id) {
            item.bloco.id = "resultado-busca-" + Date.now() + "-" + indice;
          }

          mostrarCapitulo(indiceCapitulo, false);
          history.pushState(
            { capitulo: item.capitulo.id, destino: item.bloco.id },
            "",
            "#" + encodeURIComponent(item.bloco.id)
          );
          setTimeout(function () {
            item.bloco.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 0);
        });

        resultados.appendChild(link);
      });

      if (encontrados.length > 30) {
        const limite = document.createElement("p");
        limite.textContent = "Mostrando os primeiros 30 resultados.";
        resultados.appendChild(limite);
      }
    }

    campo.addEventListener("input", executarBusca);
    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();
      executarBusca();
    });
  }



  /* =========================================================
     FUNÇÕES AUXILIARES
     ========================================================= */

  function normalizar(texto) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }


  function obterTitulo(capitulo) {

    const h1 = capitulo.querySelector(":scope > h1");

    if (!h1) return "";

    return h1.textContent
      .replace(/^\s*\d+(?:\.\d+)*\.?\s*/, "")
      .trim();
  }


  function obterIndicePorId(id) {

    return capitulos.findIndex(function (capitulo) {
      return capitulo.id === id;
    });

  }


  /* =========================================================
     CRIA OS BOTÕES ANTERIOR / PRÓXIMO
     ========================================================= */

  capitulos.forEach(function (capitulo, indice) {

    const navegacao = document.createElement("nav");

    navegacao.className = "navegacao-capitulo";
    navegacao.setAttribute(
      "aria-label",
      "Navegação entre capítulos"
    );


    /* ---------------------------------------------------------
       ANTERIOR
       --------------------------------------------------------- */

    if (indice > 0) {

      const anterior = capitulos[indice - 1];

      const linkAnterior = document.createElement("a");

      linkAnterior.href = "#" + anterior.id;
      linkAnterior.className = "nav-anterior";

      const rotulo = document.createElement("span");
      rotulo.className = "nav-rotulo";
      rotulo.textContent = "← Anterior";

      const titulo = document.createElement("span");
      titulo.className = "nav-titulo";
      titulo.textContent = obterTitulo(anterior);

      linkAnterior.appendChild(rotulo);
      linkAnterior.appendChild(titulo);

      navegacao.appendChild(linkAnterior);

    } else {

      const vazio = document.createElement("span");
      vazio.className = "nav-vazio";

      navegacao.appendChild(vazio);

    }


    /* ---------------------------------------------------------
       PRÓXIMO
       --------------------------------------------------------- */

    if (indice < capitulos.length - 1) {

      const proximo = capitulos[indice + 1];

      const linkProximo = document.createElement("a");

      linkProximo.href = "#" + proximo.id;
      linkProximo.className = "nav-proximo";

      const rotulo = document.createElement("span");
      rotulo.className = "nav-rotulo";
      rotulo.textContent = "Próximo →";

      const titulo = document.createElement("span");
      titulo.className = "nav-titulo";
      titulo.textContent = obterTitulo(proximo);

      linkProximo.appendChild(rotulo);
      linkProximo.appendChild(titulo);

      navegacao.appendChild(linkProximo);

    } else {

      const vazio = document.createElement("span");
      vazio.className = "nav-vazio";

      navegacao.appendChild(vazio);

    }


    capitulo.appendChild(navegacao);

  });


  /* =========================================================
     MOSTRA APENAS UM CAPÍTULO
     ========================================================= */

  function mostrarCapitulo(indice, atualizarURL = true) {

    if (indice < 0 || indice >= capitulos.length) {
      indice = 0;
    }


    /* Esconde todos */

    capitulos.forEach(function (capitulo) {
      capitulo.classList.remove("capitulo-ativo");
    });


    /* Mostra somente o selecionado */

    const atual = capitulos[indice];

    atual.classList.add("capitulo-ativo");


    /* Atualiza a URL */

    if (atualizarURL) {

      history.pushState(
        { capitulo: atual.id },
        "",
        "#" + atual.id
      );

    }


    /* Volta ao início da página */

    window.scrollTo({
      top: 0,
      behavior: "instant"
    });


    /* Atualiza destaque do índice */

    atualizarIndice(atual.id);

  }


  /* =========================================================
     DESTAQUE DO CAPÍTULO ATIVO NO ÍNDICE
     ========================================================= */

  function atualizarIndice(id) {

    if (!toc) return;

    const links = toc.querySelectorAll("a");

    links.forEach(function (link) {

      link.classList.remove("capitulo-toc-ativo");

      const destino =
        decodeURIComponent(
          link.getAttribute("href") || ""
        );

      if (destino === "#" + id) {
        link.classList.add("capitulo-toc-ativo");
      }

    });

  }


  /* =========================================================
     CLIQUES NOS BOTÕES ANTERIOR / PRÓXIMO
     ========================================================= */

  document.addEventListener("click", function (evento) {

    const link = evento.target.closest(
      ".navegacao-capitulo a"
    );

    if (!link) return;

    const href = link.getAttribute("href");

    if (!href || !href.startsWith("#")) return;

    const id = decodeURIComponent(
      href.substring(1)
    );

    const indice = obterIndicePorId(id);

    if (indice !== -1) {

      evento.preventDefault();

      mostrarCapitulo(indice);

    }

  });


  /* =========================================================
     CLIQUES NO ÍNDICE
     ========================================================= */

  if (toc) {

    toc.addEventListener("click", function (evento) {

      const link = evento.target.closest("a");

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href || !href.startsWith("#")) return;

      const idDestino = decodeURIComponent(
        href.substring(1)
      );


      /* -------------------------------------------------------
         Descobre a qual capítulo principal pertence
         a seção escolhida.
         ------------------------------------------------------- */

      const elementoDestino =
        document.getElementById(idDestino);


      if (!elementoDestino) return;


      const capituloDestino =
        elementoDestino.closest("section.level1");


      if (!capituloDestino) return;


      const indice =
        capitulos.indexOf(capituloDestino);


      if (indice === -1) return;


      evento.preventDefault();


      /* Mostra o capítulo */

      mostrarCapitulo(indice, false);


      /* Atualiza URL para a seção realmente escolhida */

      history.pushState(
        {
          capitulo: capituloDestino.id,
          destino: idDestino
        },
        "",
        "#" + idDestino
      );


      /* Se clicou em subseção ## ou ###,
         vai até ela depois de mostrar o capítulo */

      setTimeout(function () {

        if (idDestino !== capituloDestino.id) {

          const destino =
            document.getElementById(idDestino);

          if (destino) {

            destino.scrollIntoView({
              behavior: "auto",
              block: "start"
            });

          }

        } else {

          window.scrollTo({
            top: 0,
            behavior: "instant"
          });

        }

      }, 0);

    });

  }


  /* =========================================================
     BOTÕES VOLTAR / AVANÇAR DO NAVEGADOR
     ========================================================= */

  window.addEventListener("popstate", function () {

    abrirPelaURL(false);

  });


  /* =========================================================
     ABRE CAPÍTULO A PARTIR DA URL
     ========================================================= */

  function abrirPelaURL(atualizarURL = false) {

    const hash =
      decodeURIComponent(
        window.location.hash.replace("#", "")
      );


    /* Sem hash: primeiro capítulo */

    if (!hash) {

      mostrarCapitulo(0, atualizarURL);

      return;

    }


    const destino =
      document.getElementById(hash);


    if (!destino) {

      mostrarCapitulo(0, atualizarURL);

      return;

    }


    const capitulo =
      destino.closest("section.level1");


    if (!capitulo) {

      mostrarCapitulo(0, atualizarURL);

      return;

    }


    const indice =
      capitulos.indexOf(capitulo);


    mostrarCapitulo(indice, false);


    /* Se o endereço aponta para uma subseção,
       posiciona nela */

    if (hash !== capitulo.id) {

      setTimeout(function () {

        destino.scrollIntoView({
          behavior: "auto",
          block: "start"
        });

      }, 0);

    }

  }


    
  /* =========================================================
     INICIALIZAÇÃO
     ========================================================= */

  abrirPelaURL(false);

});
