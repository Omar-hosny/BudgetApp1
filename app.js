///////////////////////////////

// Budget controller
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(curr) {
      sum += curr.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, desc, val) {
      var newItem, ID;

      //Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new item based on "inc" or "exp"
      if (type === "exp") {
        newItem = new Expense(ID, desc, val);
      } else if (type === "inc") {
        newItem = new Income(ID, desc, val);
      }

      // push it into our data structure
      data.allItems[type].push(newItem);
      console.log(data);
      return newItem;
    },

    deleteItem: function(type, id) {
      // get array of ids
      var ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      var index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
        // console.log(data);
      }
    },

    calculateBudget: function() {
      // calculate the income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      // calculate the budget: inc - exp
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentage: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    }
  };
})();

//////////////////////// UI controller//////////////////////////////////////////////////////////////
var UIController = (function() {
  // this var have the all inputs
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  var formatNumber = function(num, type) {
    num = Math.abs(num);
    num = num.toFixed(2);

    var numSplit = num.split(".");

    var int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
      //input 23510, output 23,510
    }

    var dec = numSplit[1];
    var type;

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };
  return {
    getInputs: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;
      // Create HTML string with placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;

        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    // delete list item
    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    // clear fields
    clearFields: function() {
      // get description input and value
      var fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      // conver it into an array
      var fieldsArr = Array.prototype.slice.call(fields);

      // loop throw this array and clear each field
      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });
      // back description input to focus
      fieldsArr[0].focus();
    },
    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    /// display percentage of each expenses from income
    displayPercentage: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    displayMonth: function() {
      var now = new Date();

      var year = now.getFullYear();

      //var christmas = new Date(2016, 11, 25);

      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];

      var month = now.getMonth();

      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },
    getDOMstrings: function() {
      return DOMstrings;
    }
  };

  //some code here
})();

// Glopal app controller
var controller = (function(budgetCtrl, UICtrl) {
  var DOM = UICtrl.getDOMstrings();
  var setupEventListeners = function() {
    document.querySelector(DOM.inputBtn).addEventListener("click", addItemCtrl);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        addItemCtrl();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", deleteItemCtrl);
  };

  var updateBudget = function() {
    // 4 => Calculate the budget
    budgetCtrl.calculateBudget();
    // => return the budget
    var budget = budgetCtrl.getBudget();
    // 4 => Display the budget on the UI
    UICtrl.displayBudget(budget);
    // console.log(budget);
  };

  var updatePercentage = function() {
    // calculate percentage
    budgetCtrl.calculatePercentage();
    // read percentage from the budget controller
    var percentages = budgetCtrl.getPercentages();
    // update the percentage with new one
    UICtrl.displayPercentage(percentages);

    // console.log(percentages)
  };

  //Item controller function
  var addItemCtrl = function() {
    var inputs;
    // 1 => get the field input data
    inputs = UICtrl.getInputs();

    if (inputs.description !== "" && !isNaN(inputs.value) && inputs.value > 0) {
      // 2 => Add the item to budget controller
      var newItem = budgetCtrl.addItem(
        inputs.type,
        inputs.description,
        inputs.value
      );

      // 3 => Add the item to the UI
      UICtrl.addListItem(newItem, inputs.type);

      // clear fields
      UICtrl.clearFields();
      updateBudget();

      // calculate and update the percentage
      updatePercentage();
    }
  };

  // delete Item
  var deleteItemCtrl = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      // split by -
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      // delete the item from the UI
      UICtrl.deleteListItem(itemID);
      // update and show the new budget
      updateBudget();
      // calculate and update the percentage
      updatePercentage();
    }
  };

  return {
    init: function() {
      console.log("App has started....");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };

  //some code here
})(budgetController, UIController);

controller.init();
