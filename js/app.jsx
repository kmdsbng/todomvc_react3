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

modelProto.saveTodo = function (todoToSave, title) {
  this.todos.forEach(function (todo) {
    if (todo.id === todoToSave.id) {
      todo.title = title;
    }
  });
  this.inform();
};

modelProto.toggle = function (todoToToggle) {
  this.todos.forEach(function (todo) {
    if (todo.id === todoToToggle.id) {
      todo.completed = !todo.completed;
    }
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
          <input
            onChange={this.handleToggle}
            className="toggle"
            type="checkbox"
            checked={this.props.todo.completed} />
          <label
            onDoubleClick={this. handleDoubleClick}
            >{this.state.todoTitle}</label>
          <button className="destroy" onClick={this.handleDelete}></button>
        </div>
        <input
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          onBlur={this.handleBlur}
          className="edit" value={this.state.todoTitle} />
      </li>
    );
  },
  handleToggle: function (e) {
    this.props.onToggle(this.props.todo);
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
  },
  handleKeyDown: function (e) {
    if (e.which === ENTER_KEY) {
      this.saveTodo(e.target.value);
    } else if (e.which === ESCAPE_KEY) {
      this.setState({todoTitle: this.props.todo.title});
      this.props.cancelEdit();
    }
  },
  handleBlur: function (e) {
    this.saveTodo(e.target.value);
  },
  saveTodo: function (title) {
    title = title.trim();
    if (title === '') {
      this.props.onDelete(this.props.todo);
    } else {
      this.props.onSave(this.props.todo, title);
    }
    this.props.cancelEdit();
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
    var activeTodos = todos.filter(function (todo) {return !todo.completed; });
    var completedTodos = todos.filter(function (todo) {return todo.completed; });
    var todoItems = todos.map(function (todo) {
      return (
        <TodoItem
          key={todo.id}
          todo={todo}
          editing={this.state.editingId === todo.id}
          onDelete={this.deleteTodo}
          onEdit={this.onEdit}
          onSave={this.saveTodo}
          cancelEdit={this.cancelEdit}
          onToggle={this.toggle}
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
            <strong>{activeTodos.length}</strong> items left
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
  },
  saveTodo: function (todo, val) {
    this.props.model.saveTodo(todo, val);
  },
  cancelEdit: function () {
    this.setState({editingId: null});
  },
  toggle: function (todo) {
    this.props.model.toggle(todo);
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


