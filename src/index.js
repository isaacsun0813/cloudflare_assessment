// Define the handler for '/organization-chart' endpoint
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
async function serveReactApp(request) {
	try {
		const page = await getAssetFromKV(request);
	  return new Response(page.body, {
		...page,
		headers: {
		  'Content-Type': page.contentType
		}
	  });
	} catch (e) {
		console.error("Error in serveReactApp:", e.message);
		console.error("Request URL:", request.url);
		return new Response('Not Found', { status: 404 });
	}
  }
async function handleOrganizationChart(env) {
	const data = await env["assessment-data"].get("organizationChart", { type: "json" });
	if (!data) {
	  return new Response("Organization chart not found", { status: 404 });
	}
	return new Response(JSON.stringify({ organization: data }), {
	  headers: { 'Content-Type': 'application/json' },
	});
  }
async function handlePostOrganizationChart(request) {
	// Parse the request body to get the CSV data
	const csvString = await request.text();  // Read the body as raw text
    if (!csvString) {
        return new Response("No data sent", { status: 400 });
    }	

	const jsonData = csvToJson(csvString);
	console.log("converted data")

	if (!jsonData) {
	  return new Response("Failed to convert CSV to JSON", { status: 400 }); 
	}
  
	// Return the JSON response
	return new Response(JSON.stringify({ organization: jsonData }), {
	  headers: { 'Content-Type': 'application/json' },
	});
  }
  
  // Define the handler for '/me' endpoint
  function handleMe() {
	const personalInfo = {
	  name: "Isaac Sun",
	  homepage: "https://isaacsun.us",
	  githubURL: "https://github.com/isaacsun0813",
	  interestingFact: "I'm a musician! I play both the tuba and piano actively and have played the flute in the past.",
	  skills: ["Python", "django", "C++"],
	};
	return new Response(JSON.stringify(personalInfo), {
	  headers: { 'Content-Type': 'application/json' },
	});
  }
  function csvToJson(csvString) {
	const lines = csvString.trim().split("\n");
	const departments = {};
  
	lines.forEach((line, index) => {
	  // Skip the header line
	  if (index === 0) return;
  
	  // Split the line by commas and trim each cell
	  const cells = line.split(",").map(cell => cell.trim());
  
	  // Validation: Check if any of the required fields are empty
	  // This is critical since CSV's are a little funky and sometime we need to skip lines
	  if (cells.length < 8 || cells.some(cell => cell === "")) {
		console.log(`Skipping line ${index} due to missing data:`, line);
		return; // Skip this line and move to the next
	  }
  
	  // Destructure the cells into named variables
	  const [name, departmentName, salary, office, isManager, skill1, skill2, skill3] = cells;
  
	  // More validation here is needed make sure it works. This is just an example on salary 
	  if (isNaN(parseFloat(salary))) {
		console.log(`Skipping line ${index} due to invalid salary:`, salary);
		return; // Invalid salary, skip this line
	  }
  
	  const employee = {
		name,
		department: departmentName,
		salary: parseFloat(salary),
		office,
		isManager: isManager.toLowerCase() === 'true',
		skills: [skill1, skill2, skill3].filter(skill => skill) // filter out empty skills
	  };
  
	  // If the department doesn't exist, create it and assume the first employee is the manager
	  if (!departments[departmentName]) {
		departments[departmentName] = {
		  name: departmentName,
		  managerName: name, // Assuming the first employee is the manager
		  employees: []
		};
	  }
  
	  // Add the employee to the department
	  departments[departmentName].employees.push(employee);
	});
  
	// Convert the departments object into an array
	const departmentsArray = Object.values(departments);
  
	// Assign the first employee as manager if the managerName is empty
	departmentsArray.forEach(department => {
	  if (!department.managerName && department.employees.length > 0) {
		department.managerName = department.employees[0].name;
	  }
	});
  
	return { organization: { departments: departmentsArray } };
  }
  function isValidRegex(pattern) {
	try {
	  new RegExp(pattern);
	  return true;
	} catch (e) {
	  return false;
	}
  }
  
  function filterEmployees(organizationData, query) {
    // Flatten the array of employees from all departments since our data is in an "object"
    let allEmployees = [];
    organizationData.organization.departments.forEach(department => {
        allEmployees = allEmployees.concat(department.employees);
    });

    // Apply the filter criteria
    return allEmployees.filter(employee => {
        if (query.name && isValidRegex(query.name) && !new RegExp(query.name).test(employee.name)) {
            return false;
        }
        if (query.department && isValidRegex(query.department) && !new RegExp(query.department).test(employee.department)) {
            return false;
        }
        if (query.minSalary !== undefined && employee.salary < query.minSalary) {
            return false;
        }
        if (query.maxSalary !== undefined && employee.salary > query.maxSalary) {
            return false;
        }
        if (query.office && isValidRegex(query.office) && !new RegExp(query.office).test(employee.office)) {
            return false;
        }
        if (query.skill && isValidRegex(query.skill) && !employee.skills.some(skill => new RegExp(query.skill).test(skill))) {
            return false;
        }
        return true;
    });
}
  
  async function handleEmployeeQuery(request,env) {
	try {
	  const requestBody = await request.json();
	  const organizationData = await env["assessment-data"].get("organizationChart", { type: "json" });
	  console.log(typeof organizationData, organizationData); 
	  const matchingEmployees = filterEmployees(organizationData, requestBody);
	  
	  return new Response(JSON.stringify({ employees: matchingEmployees }), {
		headers: { 'Content-Type': 'application/json' },
	  });
	} catch (error) {
	  console.error("Error in handleEmployeeQuery:", error);
	  return new Response("Error processing the request", { status: 500 });
	}
  }
  export default {
	async fetch(request, env) {
	  const url = new URL(request.url);
	  try {
		// Route the request to the appropriate handler based on the pathname
		switch(url.pathname) {
			case "/orgchart":
				switch (request.method){
					case "GET":
						console.log("entered")
						return serveReactApp(request);
					default:
						return new Response("Method Unavailable",{status:405});
				}
		  	case "/organization-chart":
				switch (request.method){
					case "GET":
						return await handleOrganizationChart(env);
					case "POST":
						return await handlePostOrganizationChart(request,env);
					default:
						return new Response("Method Unavailable",{status:405});
				}
		  	case "/me":
				return handleMe();
			case "/employee":
				switch(request.method){
					case "POST":
						return await handleEmployeeQuery(request,env);
					default:
						return new Response("Method Unavailable",{status:405});
				}
		  	default:
				return new Response("Not Found", { status: 404 });
		}
	  } catch (error) {
		return new Response("Internal Server Error", { status: 500 });
	  }
	}
  };
  