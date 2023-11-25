import React from 'react';

// Recursive component to render the organization tree
const TreeNode = ({ node, searchQuery }) => {
  if (!node) {
    return null;
  }

  const highlightText = (text) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? 
        <span key={i} className="search-highlight">{part}</span> : part
    );
  };

  const isNodeMatchSearch = () => {
    if (!searchQuery) {
      return true; // If no search query provided, all nodes match
    }
    // Check if the node's name includes the search query
    return node.name.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return isNodeMatchSearch() ? (
    <div className="node">
      <div className="node-title">{highlightText(node.name)} {node.isManager && "(manager)"}</div>
      <div className="node-info">
        <p>Department: {node.department}</p>
        <p>Salary: ${node.salary}</p>
        <p>Office: {node.office}</p>
        {node.skills && <p>Skills: {node.skills.join(', ')}</p>}
      </div>
      {node.employees && (
        <div className="node-children">
          {node.employees.map((employee) => (
            <TreeNode key={employee.name} node={employee} searchQuery={searchQuery} />
          ))}
        </div>
      )}
    </div>
  ) : null;
};

// The main component to render the organization
const OrganizationChart = ({ data, departmentVisibility, toggleDepartmentVisibility, searchQuery }) => {
  // Function to sort employees so that the manager is first
  const sortEmployees = (employees) => {
    return employees.sort((a, b) => b.isManager - a.isManager);
  };

  const renderDepartments = (departments) => {
    return departments.map((dept) => {
      // Sort the employees so that manager comes first
      const sortedEmployees = sortEmployees(dept.employees);
      return (
        <div key={dept.name} className="department">
          <h2 onClick={() => toggleDepartmentVisibility(dept.name)}>
            {dept.name} {departmentVisibility[dept.name] ? '-' : '+'}
          </h2>
          {departmentVisibility[dept.name] && (
            <>
              {sortedEmployees.map((employee) => (
                <TreeNode key={employee.name} node={employee} searchQuery={searchQuery} />
              ))}
            </>
          )}
        </div>
      );
    });
  };

  return (
    <div className="organization-chart">
      <h1>Organization</h1>
      {data && renderDepartments(data.departments)}
    </div>
  );
};

export default OrganizationChart;
