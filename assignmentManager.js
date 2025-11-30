class Assignment{
    #grade;
    constructor(assignmentName, status, grade){
        this.assignmentName = assignmentName;
        this.status = status;
        this.#grade = null;
    }
    setGrade(newGrade){
        this.#grade = newGrade;
        this.status = newGrade > 50 ? "pass" : "fail";

    }

    getGrade(){
        return this.#grade; 
    }
}

class Student {
  constructor(fullName, email,observer, assignmentStatuses = [], overallGrade = 0) {
    this.fullName = fullName;
    this.email = email;
    this.assignmentStatuses = assignmentStatuses; 
    this.overallGrade = overallGrade;

    this.workTimers = {};   //for StartWorking method
    this.observer = observer;
  }

  notifyObserver(assignment) {
    if (this.observer && assignment) {
      this.observer.notify(this, assignment);
    }
  }

  setFullName(fullName) {
    this.fullName = fullName;
  }

  setEmail(email) {        
    this.email = email;
  }

  //finding assignmengs by name for easier use
  getAssignmentByName(name) {
    return this.assignmentStatuses.find(a => a.assignmentName === name);
  }

  updateAssignmentStatus(name, grade) {
  let assignment = this.getAssignmentByName(name);

  if (!assignment) {
    assignment = new Assignment(name, "released");
    this.assignmentStatuses.push(assignment);
    this.notifyObserver(assignment);//this has been released notification
  }

  if (grade !== undefined) {
    assignment.setGrade(grade);
    this.notifyObserver(assignment); 
    this.updateOverallGrade();
  }
}


  getAssignmentStatus(name) {
    const assignment = this.getAssignmentByName(name);
    //If assignment doesn't exist
    if (!assignment) {
      return "Hasn't been assigned";
    }

    const status = assignment.status.toLowerCase();

    if (status.includes("pass")) return "Pass";
    if (status.includes("fail")) return "Fail";

    //return whatever the status was if it isn't pass or fail
    return assignment.status;
  }

  getGrade() {
    return this.overallGrade;
  }

  //Computing average of all assignments with a grade
  updateOverallGrade() {
    const grades = this.assignmentStatuses
      .map(a => (typeof a.getGrade === "function" ? a.getGrade() : null))
      .filter(g => typeof g === "number");

    if (grades.length === 0) {
      this.overallGrade = 0;
      return;
    }

    const sum = grades.reduce((acc, g) => acc + g, 0);
    this.overallGrade = sum / grades.length;
  }

  //assigning grade a random variable
  submitAssignment(name) {
  const assignment = this.getAssignmentByName(name);
  if (!assignment) return;

  assignment.status = "submitted";
  this.notifyObserver(assignment);//"has submitted" notifier

  setTimeout(() => {
    const randomGrade = Math.floor(Math.random() * 101);
    assignment.setGrade(randomGrade);//status becomes "pass"/"fail"
    this.notifyObserver(assignment); //Pass/fail messages
    this.updateOverallGrade();
  }, 500);
}
  startWorking(name) {
  let assignment = this.getAssignmentByName(name);

  if (!assignment) {
    assignment = new Assignment(name, "released");
    this.assignmentStatuses.push(assignment);
    this.notifyObserver(assignment);
  }

  assignment.status = "working";
  this.notifyObserver(assignment);//"is working on messages"

  this.workTimers[name] = setTimeout(() => {
    this.submitAssignment(name);
    delete this.workTimers[name];
  }, 500);
}
  //Early submission reminder
  handleReminder(name) {
    //cancel pending timer
    if (this.workTimers[name]) {
      clearTimeout(this.workTimers[name]);
      delete this.workTimers[name];
    }

    let assignment = this.getAssignmentByName(name);
    if (!assignment) {
      //if they didn't even have it yet, create it as released
      assignment = new Assignment(name, "released");
      this.assignmentStatuses.push(assignment);
    }

    assignment.status = "final reminder";
    this.notifyObserver(assignment);//printing the reminder

    //submit immediately (early)
    this.submitAssignment(name);
    }
}

//Observer Class
class Observer{
  notify(student, assignment) {
    const status = assignment.status;

    if (status === "released") {
      console.log(`Observer → ${student.fullName}, ${assignment.assignmentName} has been released.`);
    } else if (status === "working") {
      console.log(`Observer → ${student.fullName} is working on ${assignment.assignmentName}.`);
    } else if (status === "submitted") {
      console.log(`Observer → ${student.fullName} has submitted ${assignment.assignmentName}.`);
    } else if (status === "pass") {
      console.log(`Observer → ${student.fullName} has passed ${assignment.assignmentName}`);
    } else if (status === "fail") {
      console.log(`Observer → ${student.fullName} has failed ${assignment.assignmentName}`);
    }
  }
}



//ClassList

class ClassList {
  constructor(observer) {
    this.observer = observer;
    this.students = [];
  }

  addStudent(student) {
    this.students.push(student);
    //Message of adding to classlist
    console.log(`${student.fullName} has been added to the classlist.`);
    return student;
  }

  removeStudent(fullName) {
    const index = this.students.findIndex(s => s.fullName === fullName);
    if (index !== -1) {
      const [removed] = this.students.splice(index, 1);
      console.log(`${removed.fullName} has been removed from the classlist.`);
      return removed;
    }
    return null;
  }

  getStudents() {
    //return a copy internal array isn't changed
    return this.students.slice();
  }

  findStudentByName(fullName) {
    return this.students.find(s => s.fullName === fullName) || null;
  }

  //Promise that releases when all names are released to all students
  releaseAssignmentsParallel(assignmentNames) {
    const promises = assignmentNames.map(name => {
      return new Promise(resolve => {
        //Making it asynchronous
        setTimeout(() => {
          for (const student of this.students) {
            //create Assignment(name, "released") if missing and notify the observer about the "released" status
            student.updateAssignmentStatus(name);
          }
          resolve();
        }, 0);
      });
    });

    return Promise.all(promises);
  }
  //For a given assignment, remind any students who haven't completed it yet
  sendReminder(assignmentName) {
    for (const student of this.students) {
      const assignment = student.getAssignmentByName(assignmentName);

      let completed = false;
      if (assignment) {
        const s = assignment.status.toLowerCase();
        completed =
          s.includes("submitted") ||
          s.includes("pass") ||
          s.includes("fail");
      }

      if (!completed) {
        //Assingnment timer
        student.handleReminder(assignmentName);
      }
    }
  }
  //Returns a list of student names who have not completed a specific assignment, or anybody who has been assigned a released assignment if no submissions
  findOutstandingAssignments(assignmentName) {
    const notSubmitted = [];
    let someoneSubmitted = false;

    for (const student of this.students) {
      const assignment = student.getAssignmentByName(assignmentName);
      if (!assignment) continue;

      const status = assignment.status.toLowerCase();
      const completed =
        status.includes("submitted") ||
        status.includes("pass") ||
        status.includes("fail");

      if (completed) {
        someoneSubmitted = true;
      } else {
        notSubmitted.push(student.fullName);
      }
    }

    //Case 1: at least one submission for this assignment
    if (someoneSubmitted) {
      return notSubmitted;
    }

    //Case 2: nobody has submitted this assignment at all
    const result = new Set();

    for (const student of this.students) {
      for (const assignment of student.assignmentStatuses) {
        const status = assignment.status.toLowerCase();
        const completed =
          status.includes("submitted") ||
          status.includes("pass") ||
          status.includes("fail");

        if (status.includes("released") && !completed) {
          result.add(student.fullName);
        }
      }
    }

    return Array.from(result);
  }
}


