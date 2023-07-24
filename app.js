const express = require('express');
const app = express();
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

//PostgreSQL connection URL
const sequelize = new Sequelize('postgres://postgres:1234@localhost:5432/kt-asset');

//Employee model
const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

// Sync the model with the database
(async () => {
  await sequelize.sync();
  console.log('Database sync Success');
})();

app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public',{"extensions":["css"]}));

app.get('/', (req, res) => {
    res.render('home');
  });

// Add Employee
app.post('/api/employees', async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const employee = await Employee.create({ name, isActive });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add the employee' });
  }
});

// Edit  Employee
app.put('/api/employees/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, isActive } = req.body;
      const employee = await Employee.findByPk(id);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      await employee.update({ name, isActive });
      res.json({ message: 'Employee updated successfully' });
    } catch (err) {
      console.log('Error during update:', err);
      res.status(500).json({ error: 'Failed to update the employee' });
    }
  });
// View Employees with filters
app.get('/api/employees', async (req, res) => {
    try {
      const { isActive } = req.query;
      const filterOptions = {};
      if (isActive !== undefined) {
        filterOptions.isActive = isActive === 'true';
      }
      const employees = await Employee.findAll({ where: filterOptions });
  
      // Check if there are no employees in the database
      if (employees.length === 0) {
        return res.status(404).json({ error: 'No employees found' });
      }
  
      res.json(employees);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Edit  Employee - Render the edit form
app.get('/employees/:id/edit', async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await Employee.findByPk(id);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.render('edit_employee', { employee });
    } catch (err) {
      res.status(500).send('Internal Server Error');
    }
  });
  app.set('views', path.join(__dirname, 'views'));
    
// Delete an Employee
  app.delete('/api/employees/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Employee.destroy({ where: { id } });
      if (deleted === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete the employee' });
    }
});
  
//Jade file
app.set('views', './views');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
  
app.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.findAll();
      res.render('employees', { employees });
    } catch (err) {
      res.status(500).send('Internal Server Error');
    }
});
// Employees master ends

//Assets Master
//Asset model
const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  serialNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  assetType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  makeModel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
// Add Asset
app.post('/api/assets', async (req, res) => {
  try {
    const { serialNumber, assetType, makeModel } = req.body;
    const asset = await Asset.create({ serialNumber, assetType, makeModel });
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add the asset' });
  }
});
// Edit Asset
app.put('/api/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { serialNumber, assetType, makeModel } = req.body;
    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    await asset.update({ serialNumber, assetType, makeModel });
    res.json({ message: 'Asset updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update the asset' });
  }
});
// Delete Asset
app.delete('/api/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Asset.destroy({ where: { id } });
    if (deleted === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete the asset' });
  }
});
// Handle the delete request from the "Delete" button
app.get('/assets/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    await asset.destroy();
    res.redirect('/assets');
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});

// View all Assets with filters
app.get('/api/assets', async (req, res) => {
  try {
    const assets = await Asset.findAll();
    if (assets.length === 0) {
      return res.status(404).json({ error: 'No assets found' });
    }
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});
// View Asset Details
app.get('/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.render('asset_details', { asset });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});// Render the "View Details" page for the particular employee
app.get('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: AssetIssuance,
          attributes: [],
          include: [{ model: Asset }],
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const issuedAssets = employee.AssetIssuances; // The issued assets for the employee

    res.render('employeeDetails', { employee, issuedAssets });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
app.get('/api/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    console.log(asset);
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch asset details' });
  }
});
//Jade file for Asset Master
app.get('/assets', async (req, res) => {
  try {
    const assets = await Asset.findAll();
    res.render('assets', { assets });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
//Asset Master Ends

//AssetCategoriesMaster
//Assetcategories Modal
const AssetCategory = sequelize.define('AssetCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

//view assetcategories
app.get('/assetCategories', async (req, res) => {
  try {
    const assetCategories = await AssetCategory.findAll();
    res.render('assetCategories', { assetCategories });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
//Add asset categories
app.post('/assetCategories', async (req, res) => {
  try {
    const { name } = req.body;
    await AssetCategory.create({ name });
    res.redirect('/assetCategories');
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
//delete asset category
app.delete('/assetCategories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await AssetCategory.destroy({ where: { id } });
    res.redirect('/assetCategories');
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
//Add a new asset category
app.get('/addAssetCategory', (req, res) => {
  res.render('addAssetCategory');
});

//Issue Assets
const AssetIssuance = sequelize.define('AssetIssuance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  issuedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  issuedBy:{
    type: DataTypes.STRING,
    allowNull:true,
  }
});
AssetIssuance.belongsTo(Employee);
AssetIssuance.belongsTo(Asset);
//Issue Asset Route
app.get('/issueAsset', async (req, res) => {
  try {
    const assets = await Asset.findAll();
    res.render('issueAsset', { assets });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
//Handle issue asset submission
app.post('/issueAsset', async (req, res) => {
  try {
    const { employeeName, assetId } = req.body;

    // Find the employee by name
    const employee = await Employee.findOne({ where: { name: employeeName } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Find the asset by ID
    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

// Issue the asset to the employee
    await AssetIssuance.create({
      EmployeeId: employee.id,
      AssetId: asset.id,
    });

    res.redirect('/assets'); // Redirect to the assets page or a confirmation page
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
// Render the "Issue Asset" form
app.get('/issueAsset', async (req, res) => {
  try {
    const assets = await Asset.findAll();
    res.render('issueAsset', { assets }); // Pass the list of assets to the view
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});
// Handle the form submission to issue the asset
app.post('/issueAsset', async (req, res) => {
  try {
    const { employeeName, assetId } = req.body;

    // Find the employee by name
    const employee = await Employee.findOne({ where: { name: employeeName } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Find the asset by ID
    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Issue the asset to the employee
    await AssetIssuance.create({
      EmployeeId: employee.id,
      AssetId: asset.id,
      issuedBy: 'Admin', // Replace 'Admin' with the name or identifier of the user who issued the asset
    });

    res.redirect(`/employees/${employee.id}`); // Redirect to the employee's "View Details" page
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

