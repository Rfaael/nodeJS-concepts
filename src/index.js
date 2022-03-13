const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//VERIFICA SE A TASK EXISTE
function checkIfTaskExists(request, response, next) {
  //user
  const {user} =  request;
  
  //console.log(user)
  
  //task ID
  const {id} = request.params;

  //RETORNA A TASK EXISTENTE
  const taskExists = user.todos.find(task => task.id === id);

  //console.log(taskExists)

  if(taskExists){
    next();
  }else {
    return response.status(404).json({
      error: 'Mensagem do erro TASK'
    });
  };
}

//VERIFICA SE A CONTA DO USER EXISTE
function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(user => user.username == username);

  if(user){
    request.user = user;
    next();
  }else {
    return response.status(404).json({
      error: 'Mensagem do erro USER'
    })
  }
}

//ROTA PARA CADASTRAR USER
app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const teste = users.find(user => user.name === name);
  const teste2 = users.find(user => user.username === username);


  if(teste && teste2){
    return response.status(400).json({
      error: 'Mensagem do erro'
    })
  }

  const newUser = users.push({
    id: uuidv4(),
    name, 
    username,
    todos: []
  });

  return response.status(201).json(users[newUser - 1]);
});

//ROTA PARA VER TODAS AS TAREFAS DO USER
//USER(username) PASSADO PELO HEADER
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  

  return response.status(200).json(user.todos)
});

//CADASTRA UMA NOVA TAREFA
//USER(username) PASSADO PELO HEADER
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  
  const {title, deadline} = request.body;

  const newTask = user.todos.push({
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false
  })


  return response.status(201).send(user.todos[newTask - 1]);
});

//MODIFICA UMA TASK PELO ID
//PODENDO MOIFICAR SOMENTE O TITLE E O DEADLINE
app.put('/todos/:id', checksExistsUserAccount, checkIfTaskExists,(request, response) => {
  //task id
  const {id} = request.params;

  const {title, deadline} = request.body;

  const user = request.user;

  let taskForUpdate = user.todos.filter(task => task.id === id);

  //check if the title and deadline is empty
  taskForUpdate[0].title    = title ? title : taskForUpdate[0].title;
  taskForUpdate[0].deadline = deadline ? new Date(deadline) : taskForUpdate[0].deadline;


  return response.json(taskForUpdate[0]);
});

//MARCA DONE COMO TRUE
//TASK E PASSADA PELO PARAMETRO COM SEU ID
//USERNAME PASSADO PELO HEADER
app.patch('/todos/:id/done', checksExistsUserAccount, checkIfTaskExists,(request, response) => {
  const {id} = request.params;

  const user = request.user;

  const changeDone = user.todos.find(task => task.id === id);

  if(changeDone){
    changeDone.done = true;
  }

  /*
  console.log(changeDone)
  console.log("***********************")
  console.log(user)
  */
  return response.status(200).json(changeDone);
});

//DELETA UMA TASK 
//SEU ID E PASSADO PELO PARAMS
//USERNAME PELO HEADER
app.delete('/todos/:id', checksExistsUserAccount, checkIfTaskExists,(request, response) => {
  const {id} = request.params;
  
  const user = request.user;

  const taskIndex = user.todos.findIndex(task => task.id === id);

  user.todos.splice(taskIndex, 1);

  return response.status(204).end();
});

module.exports = app;