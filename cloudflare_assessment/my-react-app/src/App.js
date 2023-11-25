import { orgChartData } from './data/orgChartData';
import React, { useState } from 'react';
import OrganizationChart from './OrganizationChart';
import './App.css';
import SearchBar from './searchbar';

const App = () => {
  const [departmentVisibility, setDepartmentVisibility] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const toggleDepartmentVisibility = (departmentName) => {
    setDepartmentVisibility((prevVisibility) => ({
      ...prevVisibility,
      [departmentName]: !prevVisibility[departmentName],
    }));
  };

  const handleSearch = (query) => {
    if (query.trim() === '') {
      setShowModal(false);
      return;
    }

    // Flatten the array of employees from all departments
    const allEmployees = orgChartData.organization.departments
      .flatMap(dept => dept.employees);

    // Filter employees based on the search query
    const results = allEmployees.filter(employee =>
      employee.name.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results);
    setShowModal(true);
  };

  const renderSearchModal = () => {
    return showModal && (
      <div className="search-modal">
        {searchResults.map((employee) => (
          <div key={employee.name} className="search-result">
            <h4>{employee.name}</h4>
            <p>Department: {employee.department}</p>
            <p>Salary: ${employee.salary}</p>
            <p>Office: {employee.office}</p>
            <p>Skills: {employee.skills.join(', ')}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="App">
      <div className="App-content">
        <OrganizationChart
          data={orgChartData.organization}
          departmentVisibility={departmentVisibility}
          toggleDepartmentVisibility={toggleDepartmentVisibility}
        />
        <SearchBar onSearch={handleSearch} />
        {renderSearchModal()}
      </div>
    </div>
  );
};

export default App;
