/*const sec_frame = [
  { section: "sectionA", tasks: 4, params: 5 },
  { section: "sectionB", tasks: 5, params: 3 },
  { section: "sectionC", tasks: 20, params: 1 },
  { section: "sectionD", tasks: 5, params: 4 },
  { section: "sectione", tasks: 6, params: 5 }
];*/

const sec_frame = [
  // { section: "sectionA", tasks: 1, params: 5 },
  { section: "sectionB", tasks: 1, params: 3 },
  // { section: "sectionC", tasks: 1, params: 1 },
  // { section: "sectionD", tasks: 1, params: 4 },
  { section: "sectionE", tasks: 6, params: 5 }
];

const btn_main = document.querySelector('.btn-main');
const data_prom = fetch('/data.json').then(data => data.json());
let curr_sec = 0;

/********************************************************************/

function disappr() {
  const [hdr, main] = [
    document.querySelector('header'),
    document.querySelector('main')
  ];

  function cleanElements() {
    document.body.removeChild(hdr);
    document.body.removeChild(main);
    hdr.removeEventListener('transitionend', cleanElements);
    document.addEventListener('click', globListener);
    turn();
  };

  hdr.addEventListener('transitionend', cleanElements);
  
  main.removeChild(btn_main);
  hdr.classList.add('header-hide');
  btn_main.removeEventListener('click', disappr);
}

btn_main.addEventListener('click', disappr);
/********************************************************************/

// first object here is because I noob (see "turn" func)
let all_tasks = [{section: "sectionA"}];

sec_frame.forEach(el => {
  for (let i = 0; i < el.tasks; i++) {
    let new_obj = {};

    new_obj.section = el.section;
    new_obj.task = String(i+1);
    new_obj.params = new Array(el.params);
    for (let i = 0; i < new_obj.params.length; i++) new_obj.params[i] = '0';
    new_obj.check = check;
    all_tasks.push(new_obj);
  }
});

// helper function 1
function check() {
  return this.params.every(value => value !== '0');
}
// helper function 2
function removeOldSection() {
  document.body.removeChild(
      document.querySelector(`.${all_tasks[curr_sec-1].section}`));
}

function globListener(evt) {
  // skip if click event is not from some button
  if (!evt.target.id.startsWith('btn')) return;
  const btn_parsed = evt.target.id.split('-').slice(1);

  // if it is a "next" button
  if (btn_parsed[0] === 'next') {
    // and current section is not last, take a step
    if (curr_sec !== all_tasks.length-1) turn();
    // TODO: final preparetion, render results into tables and append to body
    else {
      document.body.removeChild(
        document.querySelector(`.${all_tasks[curr_sec].section}`));
      renderAnswers();
    }
  } else if (btn_parsed[0] === 'ans') {
    // set value to "params" property of current task object
    if (all_tasks[curr_sec].params[parseInt(btn_parsed[1])-1] !== '0') {
      let last_value = all_tasks[curr_sec].params[parseInt(btn_parsed[1])-1];
      document.querySelector(`#btn-ans-${btn_parsed[1]}-${last_value}`)
        .classList.remove('active');
      all_tasks[curr_sec].params[parseInt(btn_parsed[1])-1] = btn_parsed[2];
      evt.target.classList.add('active');
    } else {
      evt.target.classList.add('active');
      all_tasks[curr_sec].params[parseInt(btn_parsed[1])-1] = btn_parsed[2];
      if (all_tasks[curr_sec].check()) 
        document.getElementById('btn-next').removeAttribute('disabled');
    }
  }
}

function turn() {
  if (curr_sec++ !== 0) removeOldSection();

  data_prom.then(data => {
    let new_el = document.createElement('section');
    new_el.classList.add(`${all_tasks[curr_sec].section}`);
    // here I have ugly construction coz I noob
    new_el.innerHTML = document.querySelector(`#${all_tasks[curr_sec].section}`)
    .innerHTML.replace(/\{\{.+?\}\}/g, match => {
      return data[all_tasks[curr_sec].section][parseInt(all_tasks[curr_sec].task) - 1][match.replace(/[\{\}]/g, '')];
    });
    document.body.insertBefore(new_el, document.body.childNodes[0]);
  });
}

// returns HTMLElement div.final with all HTML of last page
function renderAnswers() {
  all_tasks.splice(0, 1);

  let inHTML = '';

  sec_frame.forEach(obj => {

    let arr = all_tasks
      .filter(el => el.section === obj.section)
      .reduce((accumulator, currentValue) => {
        accumulator.push(currentValue.params);
        return accumulator;
      }, []);

    // TODO: test presence of new line characters between sections code
    inHTML += renderSection(obj.section.slice(-1), arr);
  });
  document.body.innerHTML = inHTML;
}

// "section": String, name of a section, "A", "B" etc.
// "answers": Array of "params" field for all tasks 
// returns String with HTML of table for given section
function renderSection(section, answers) {
  console.log(answers);
  switch(section) {
    case 'A': {
      let html_string = 
        `<table class="final-block centering">
          <caption>Секция ${section}</caption>`;

      html_string += '<tr>';
      html_string += '<th></th>';
      for (let i = 0; i < answers.length; i++)
        html_string += `<th>Лицо ${String(i+1)}</th>`;
      html_string += '</tr>';
      
      for (let i = 0; i < answers[0].length; i++) {
        html_string += '<tr>';
        html_string += `<td>${String(i+1)}</td>`;
        answers.forEach(el => {
          html_string += `<td>${el[i]}</td>`;
        });
        html_string += '</tr>';
      }
      
      html_string += '</table>'

      return html_string;
    }; break;

    case 'B': {
      let items = ['a.', 'b.', 'c.'];
      let html_string = 
        `<table class="final-block centering">
          <caption>Секция ${section}</caption>`;

      html_string += '<tr>';
      html_string += '<th></th>';
      for (let i = 0; i < answers.length; i++)
        html_string += `<th>Вопрос ${String(i+1)}</th>`;
      html_string += '</tr>';     
      for (let i = 0; i < answers[0].length; i++) {
        html_string += '<tr>';
        html_string += `<td>${items[i]}</td>`;
        answers.forEach(el => {
          html_string += `<td>${el[i]}</td>`;
        });
        html_string += '</tr>';
      }
      html_string += '</table>';
      return html_string;
    }; break;

    case 'C': {
      let html_string = `<table class="final-block centering"><caption>Секция ${section}</caption>`;
      html_string += '<tr><th>№</th><th>Ответ</th><th>№</th><th>Ответ</th>';
      for (let i = 0; i < 10; i++) {
        html_string += `<tr><td>${String(i+1)}</td><td>${answers[i][0]}</td><td>${String(i+11)}</td><td>${answers[i+10][0]}</td></tr>`;
      }
      html_string += '</table>';
      return html_string;
    };
    break;

    case 'D': {
      let html_string = 
        `<table class="final-block centering">
          <caption>Секция ${section}</caption>`;

      html_string += '<tr>';
      html_string += '<th></th>';
      for (let i = 0; i < answers.length; i++)
        html_string += `<th>Ситуаця ${String(i+1)}</th>`;
      html_string += '</tr>';     
      for (let i = 0; i < answers[0].length; i++) {
        html_string += '<tr>';
        html_string += '<td></td>';
        answers.forEach(el => {
          html_string += `<td>${el[i]}</td>`;
        });
        html_string += '</tr>';
      }
      html_string += '</table>';
      return html_string;
    }; break;

    case 'E': {
      let html_string = 
        `<table class="final-block centering">
          <caption>Картина ${section}</caption>`;

      html_string += '<tr>';
      html_string += '<th></th>';
      for (let i = 0; i < answers.length; i++)
        html_string += `<th>Лицо ${String(i+1)}</th>`;
      html_string += '</tr>';
      
      for (let i = 0; i < answers[0].length; i++) {
        html_string += '<tr>';
        html_string += `<td>${String(i+1)}</td>`;
        answers.forEach(el => {
          html_string += `<td>${el[i]}</td>`;
        });
        html_string += '</tr>';
      }
      
      html_string += '</table>'

      return html_string;
    }; break;
  }
}