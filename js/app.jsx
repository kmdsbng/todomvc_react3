/* global React, Router, Utils, classNames */

var app = app || {};

var cx = classNames;


app.ALL_TODOS = 'all';
app.ACTIVE_TODOS = 'active';
app.COMPLETED_TODOS = 'completed';

var ESCAPE_KEY = 27;
var ENTER_KEY = 13;

var TodoModel = function (key) {
  this.key = key;
  this.subscribers = [];
  this.todos = app.Utils.store(key);
};

var modelProto = TodoModel.prototype;

modelProto.subscribe = function (subscriber) {
  this.subscribers.push(subscriber);
};

modelProto.addTodo = function (title) {
  var todo = {
    id: app.Utils.uuid(),
    title: title,
    completed: false
  };
  this.todos.push(todo);
  this.inform();
};

modelProto.inform = function () {
  app.Utils.store(this.key, this.todos);
  this.subscribers.forEach(function (subscriber) {subscriber(); });
};

modelProto.deleteTodo = function (todoToDelete) {
  this.todos = this.todos.filter(function (todo) {
    return todo.id !== todoToDelete.id;
  });
  this.inform();
};

var TodoItem = React.createClass({
  getInitialState: function () {
    return {
      todoTitle: this.props.todo.title
    };
  },
  render: function () {
    return (
      <li className={cx({completed: this.props.todo.completed, editing: this.props.editing})}>
        <div className="view">
          <input className="toggle" type="checkbox" checked={this.props.todo.completed} />
          <label
            onDoubleClick={this. handleDoubleClick}
            >{this.state.todoTitle}</label>
          <button className="destroy" onClick={this.handleDelete}></button>
        </div>
        <input
          onChange={this.handleChange}
          className="edit" value={this.state.todoTitle} />
      </li>
    );
  },
  handleDelete: function (e) {
    this.props.onDelete(this.props.todo);
  },
  handleDoubleClick: function (e) {
    console.log('double click');
    this.props.onEdit(this.props.todo);
  },
  handleChange: function (e) {
    this.setState({todoTitle: e.target.value});
  }
});

var TodoApp = React.createClass({
  getInitialState: function () {
    return {
      editingId: null
    };
  },
  render: function () {

    var todos = this.props.model.todos;
    console.log(todos);
    var todoItems = todos.map(function (todo) {
      return (
        <TodoItem
          key={todo.id}
          todo={todo}
          editing={this.state.editingId === todo.id}
          onDelete={this.deleteTodo}
          onEdit={this.onEdit}
        />
      );
    }, this);

    return (
      <div>
        <header id="header">
          <h1>todos</h1>
          <input
            id="new-todo"
            placeholder="What needs to be done?"
            onKeyDown={this.handleKeyDown}
          />
        </header>
        <section id="main">
          <input id="toggle-all" type="checkbox" />
          <ul id="todo-list">
            {todoItems}
          </ul>
        </section>

        <footer id="footer">
          <span id="todo-count">
            <strong>2</strong> items left
          </span>
          <ul id="filters">
            <li>
              <a href="#/" className="selected">All</a>
            </li>
            <li>
              <a href="#/active" className="">Active</a>
            </li>
            <li>
              <a href="#/completed" className="">Completed</a>
            </li>

          </ul>
          <button id="clear-completed" >Clear completed</button>
        </footer>

      </div>
    );
  },
  handleKeyDown: function (e) {
    if (e.which === ENTER_KEY) {
      e.preventDefault();
      var val = e.target.value.trim();
      this.props.model.addTodo(val);
      e.target.value = '';
    }
  },
  deleteTodo: function (todo) {
    this.props.model.deleteTodo(todo);
  },
  onEdit: function (todo) {
    this.setState({editingId: todo.id});
  }
});

var todoModel = new TodoModel('react-todos');

function render() {
  React.render(
    <TodoApp model={todoModel} />,
    document.getElementById('todoapp')
  );
}

todoModel.subscribe(render);

render();


