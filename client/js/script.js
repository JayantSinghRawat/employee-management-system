document.addEventListener('DOMContentLoaded', () => {
    const employeeForm = document.getElementById('employeeForm');
    const employeeList = document.getElementById('employeeList');
    let editingId = null;

    function fetchEmployees() {
        fetch('http://localhost:3001/api/employees')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                employeeList.innerHTML = '';
                data.forEach(employee => {
                    addEmployeeToTable(employee);
                });
            })
            .catch(error => {
                console.error('Fetch Error:', error);
                alert('Error loading employees. Check console for details.');
            });
    }

    function addEmployeeToTable(employee) {
        const row = document.createElement('tr');
        row.dataset.id = employee._id;

        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.email}</td>
            <td>${employee.position}</td>
            <td>₹${employee.salary}</td>
            <td class="actions">
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
            </td>
        `;

        employeeList.appendChild(row);

        row.querySelector('.edit').addEventListener('click', () => editEmployee(employee._id));
        row.querySelector('.delete').addEventListener('click', () => deleteEmployee(employee._id));
    }

    employeeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const employee = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            position: document.getElementById('position').value,
            salary: parseFloat(document.getElementById('salary').value)
        };

        if (editingId) {
            // Update existing employee
            fetch(`http://localhost:3001/api/employees/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employee)
            })
                .then(response => {
                    if (!response.ok) throw new Error('Update failed');
                    return response.json();
                })
                .then(() => {
                    fetchEmployees(); // Refresh the list
                    employeeForm.reset();
                    editingId = null;
                    employeeForm.querySelector('button').textContent = 'Add Employee';
                })
                .catch(error => {
                    console.error('Update Error:', error);
                    alert('Failed to update employee. Check console for details.');
                });
        } else {
            fetch('http://localhost:3001/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employee)
            })
                .then(response => {
                    if (!response.ok) throw new Error('Add failed');
                    return response.json();
                })
                .then(data => {
                    addEmployeeToTable(data);
                    employeeForm.reset();
                })
                .catch(error => {
                    console.error('Add Error:', error);
                    alert('Failed to add employee. Check console for details.');
                });
        }
    });

    function editEmployee(id) {
        fetch(`http://localhost:3001/api/employees/${id}`)
            .then(response => {
                if (!response.ok) throw new Error('Employee not found');
                return response.json();
            })
            .then(employee => {
                // Check if employee data is valid
                if (!employee || !employee._id) {
                    throw new Error('Invalid employee data received');
                }

                document.getElementById('name').value = employee.name;
                document.getElementById('email').value = employee.email;
                document.getElementById('position').value = employee.position;
                document.getElementById('salary').value = employee.salary;

                editingId = employee._id;
                employeeForm.querySelector('button').textContent = 'Update Employee';

                employeeForm.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                console.error('Edit Error:', error);
                alert('Error loading employee for editing. Check console for details.');
            });
    }

    function deleteEmployee(id) {
        if (confirm('Are you sure you want to delete this employee?')) {
            fetch(`http://localhost:3001/api/employees/${id}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (!response.ok) throw new Error('Delete failed');
                    return response.json();
                })
                .then(() => {
                    document.querySelector(`tr[data-id="${id}"]`)?.remove();
                    if (editingId === id) {
                        employeeForm.reset();
                        editingId = null;
                        employeeForm.querySelector('button').textContent = 'Add Employee';
                    }
                })
                .catch(error => {
                    console.error('Delete Error:', error);
                    alert('Failed to delete employee. Check console for details.');
                });
        }
    }

    fetchEmployees();
});