import React, { useEffect, useState } from 'react';

export default function CreateTaskModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    deadline: '',
    status: '',
    attachment: null,
  });

  const [columnOptions, setColumnOptions] = useState([]);
  const [assignees, setAssignees] = useState([]);


  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/columns");
        const data = await res.json();
        setColumnOptions(data);
      } catch (err) {
        console.error("Failed to fetch columns:", err);
      }
    };

    
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users");
      const data = await res.json();
      setAssignees(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };


    fetchColumns();
    fetchUsers(); 
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    for (const key in formData) {
      if (formData[key]) {
        form.append(key, formData[key]);
      }
    }

    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        body: form,
      });

      if (res.ok) {
        const task = await res.json();
        onSuccess(task);
        onClose();
      } else {
        console.error('Task creation failed');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create Task</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" name="title" placeholder="Title" onChange={handleChange} className="w-full p-2 rounded border" required />
          <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full p-2 rounded border"></textarea>
          <input type="file" name="attachment" onChange={handleChange} className="w-full" />
          <select name="assignee" onChange={handleChange} className="w-full p-2 rounded border" required>
            <option value="">Select Assignee</option>
            {assignees.map((user) => (
                <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
          <input type="date" name="deadline" onChange={handleChange} className="w-full p-2 rounded border" />

          <select name="status" onChange={handleChange} className="w-full p-2 rounded border">
            <option value="">Select Status</option>
            {columnOptions.map((col) => (
              <option key={col._id} value={col.name}>{col.name}</option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Close</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// import React, { useState } from 'react';

// export default function CreateTaskModal({ onClose, onSuccess }) {
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     assignee: '',
//     deadline: '',
//     status: '',
//     attachment: null,
//   });

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === 'attachment') {
//       setFormData({ ...formData, [name]: files[0] });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const form = new FormData();
//     for (const key in formData) {
//       if (formData[key]) {
//         form.append(key, formData[key]);
//       }
//     }

//     try {
//       const res = await fetch('http://localhost:5000/api/tasks', {
//         method: 'POST',
//         body: form,
//       });

//       if (res.ok) {
//         const task = await res.json();
//         onSuccess(task);
//         onClose();
//       } else {
//         console.error('Task creation failed');
//       }
//     } catch (err) {
//       console.error('Error:', err);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-lg w-full max-w-md">
//         <h2 className="text-xl font-semibold mb-4">Create Task</h2>
//         <form onSubmit={handleSubmit} className="space-y-3">
//           <input type="text" name="title" placeholder="Title" onChange={handleChange} className="w-full p-2 rounded border" required />
//           <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full p-2 rounded border"></textarea>
//           <input type="file" name="attachment" onChange={handleChange} className="w-full" />
//           <input type="text" name="assignee" placeholder="Select Assignee" onChange={handleChange} className="w-full p-2 rounded border" />
//           <input type="date" name="deadline" onChange={handleChange} className="w-full p-2 rounded border" />
//           <input type="text" name="status" placeholder="Status" onChange={handleChange} className="w-full p-2 rounded border" />

//           <div className="flex justify-end gap-2">
//             <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Close</button>
//             <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
