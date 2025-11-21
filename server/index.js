import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get dashboard overview data
app.get('/api/dashboard', async (req, res) => {
  try {
    const metrics = await sql`
      SELECT metric_name, metric_value 
      FROM dashboard_metrics
    `;
    
    const data = {};
    metrics.forEach(m => {
      data[m.metric_name] = m.metric_value;
    });
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get high cost patients
app.get('/api/high-cost-patients', async (req, res) => {
  try {
    const patients = await sql`
      SELECT 
        hcp.*,
        p.name,
        p.mrn,
        p.age
      FROM high_cost_patients hcp
      JOIN patients p ON hcp.patient_id = p.id
      ORDER BY hcp.total_cost DESC
    `;
    
    res.json(patients);
  } catch (error) {
    console.error('Error fetching high cost patients:', error);
    res.status(500).json({ error: 'Failed to fetch high cost patients' });
  }
});

// Get readmissions
app.get('/api/readmissions', async (req, res) => {
  try {
    const readmissions = await sql`
      SELECT 
        r.*,
        p.name,
        p.mrn,
        p.age
      FROM readmissions r
      JOIN patients p ON r.patient_id = p.id
      ORDER BY r.readmission_date DESC
    `;
    
    res.json(readmissions);
  } catch (error) {
    console.error('Error fetching readmissions:', error);
    res.status(500).json({ error: 'Failed to fetch readmissions' });
  }
});

// Get medication adherence
app.get('/api/medication-adherence', async (req, res) => {
  try {
    const adherence = await sql`
      SELECT 
        ma.*,
        p.name,
        p.mrn,
        p.age
      FROM medication_adherence ma
      JOIN patients p ON ma.patient_id = p.id
      WHERE ma.adherence_rate < 60
      ORDER BY ma.adherence_rate ASC
    `;
    
    res.json(adherence);
  } catch (error) {
    console.error('Error fetching medication adherence:', error);
    res.status(500).json({ error: 'Failed to fetch medication adherence' });
  }
});

// Get care gaps summary grouped by type
app.get('/api/care-gaps/summary', async (req, res) => {
  try {
    const summary = await sql`
      SELECT
        gap_type,
        COUNT(*) as total_gaps,
        AVG(days_overdue)::int as avg_days_overdue,
        MAX(days_overdue) as max_days_overdue,
        SUM(CASE WHEN days_overdue > 60 THEN 1 ELSE 0 END) as high_priority_count
      FROM care_gaps
      GROUP BY gap_type
      ORDER BY total_gaps DESC
    `;

    res.json(summary);
  } catch (error) {
    console.error('Error fetching care gaps summary:', error);
    res.status(500).json({ error: 'Failed to fetch care gaps summary' });
  }
});

// Get care gaps by specific type
app.get('/api/care-gaps/type/:gapType', async (req, res) => {
  try {
    const { gapType } = req.params;
    const gaps = await sql`
      SELECT
        cg.*,
        p.name,
        p.mrn,
        p.age
      FROM care_gaps cg
      JOIN patients p ON cg.patient_id = p.id
      WHERE cg.gap_type = ${gapType}
      ORDER BY cg.days_overdue DESC
    `;

    res.json(gaps);
  } catch (error) {
    console.error('Error fetching care gaps by type:', error);
    res.status(500).json({ error: 'Failed to fetch care gaps by type' });
  }
});

// Get all care gaps
app.get('/api/care-gaps', async (req, res) => {
  try {
    const gaps = await sql`
      SELECT
        cg.*,
        p.name,
        p.mrn,
        p.age
      FROM care_gaps cg
      JOIN patients p ON cg.patient_id = p.id
      ORDER BY cg.days_overdue DESC
    `;

    res.json(gaps);
  } catch (error) {
    console.error('Error fetching care gaps:', error);
    res.status(500).json({ error: 'Failed to fetch care gaps' });
  }
});

// Get all gap categories
app.get('/api/gap-categories', async (req, res) => {
  try {
    const categories = await sql`
      SELECT * FROM gap_categories
      ORDER BY amount DESC
    `;

    res.json(categories);
  } catch (error) {
    console.error('Error fetching gap categories:', error);
    res.status(500).json({ error: 'Failed to fetch gap categories' });
  }
});

// Get gap category by slug with top doctors and patients
app.get('/api/gap-categories/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Get the gap category
    const [category] = await sql`
      SELECT * FROM gap_categories WHERE slug = ${slug}
    `;

    if (!category) {
      return res.status(404).json({ error: 'Gap category not found' });
    }

    // Get top doctors for this category
    const topDoctors = await sql`
      SELECT
        d.name,
        gtd.spend,
        gtd.patient_count,
        gtd.avg_per_patient,
        gtd.benchmark_avg,
        gtd.top_performer_avg,
        gtd.percent_above_benchmark,
        gtd.cost_drivers,
        gtd.opportunities
      FROM gap_top_doctors gtd
      JOIN doctors d ON gtd.doctor_id = d.id
      WHERE gtd.gap_category_id = ${category.id}
      ORDER BY gtd.rank ASC
    `;

    // Get top patients for this category
    const topPatients = await sql`
      SELECT
        p.name,
        p.age,
        gtp.spend,
        gtp.spend_category,
        gtp.cost_drivers
      FROM gap_top_patients gtp
      JOIN patients p ON gtp.patient_id = p.id
      WHERE gtp.gap_category_id = ${category.id}
      ORDER BY gtp.rank ASC
    `;

    res.json({
      ...category,
      topDoctors,
      topPatients
    });
  } catch (error) {
    console.error('Error fetching gap category:', error);
    res.status(500).json({ error: 'Failed to fetch gap category' });
  }
});

// Get all top doctors across all categories
app.get('/api/top-doctors', async (req, res) => {
  try {
    const doctors = await sql`
      SELECT
        gc.slug,
        gc.category,
        gc.amount,
        gc.percent,
        gc.color,
        d.name,
        gtd.spend,
        gtd.patient_count,
        gtd.avg_per_patient,
        gtd.benchmark_avg,
        gtd.top_performer_avg,
        gtd.percent_above_benchmark,
        gtd.cost_drivers,
        gtd.opportunities,
        gtd.rank
      FROM gap_top_doctors gtd
      JOIN gap_categories gc ON gtd.gap_category_id = gc.id
      JOIN doctors d ON gtd.doctor_id = d.id
      ORDER BY gc.amount DESC, gtd.rank ASC
    `;

    // Group by category
    const grouped = doctors.reduce((acc, doc) => {
      const key = doc.slug;
      if (!acc[key]) {
        acc[key] = {
          category: doc.category,
          amount: doc.amount,
          percent: doc.percent,
          color: doc.color,
          topDoctors: []
        };
      }
      acc[key].topDoctors.push({
        name: doc.name,
        spend: doc.spend,
        patients: doc.patient_count,
        avgPerPatient: doc.avg_per_patient,
        benchmarkAvg: doc.benchmark_avg,
        topPerformerAvg: doc.top_performer_avg,
        percentAboveBenchmark: doc.percent_above_benchmark,
        costDrivers: doc.cost_drivers,
        opportunities: doc.opportunities
      });
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Error fetching top doctors:', error);
    res.status(500).json({ error: 'Failed to fetch top doctors' });
  }
});

// Get all top patients across all categories
app.get('/api/top-patients', async (req, res) => {
  try {
    const patients = await sql`
      SELECT
        gc.slug,
        gc.category,
        gc.amount,
        gc.percent,
        gc.color,
        p.name,
        p.age,
        gtp.spend,
        gtp.spend_category,
        gtp.cost_drivers,
        gtp.rank
      FROM gap_top_patients gtp
      JOIN gap_categories gc ON gtp.gap_category_id = gc.id
      JOIN patients p ON gtp.patient_id = p.id
      ORDER BY gc.amount DESC, gtp.rank ASC
    `;

    // Group by category
    const grouped = patients.reduce((acc, pat) => {
      const key = pat.slug;
      if (!acc[key]) {
        acc[key] = {
          category: pat.category,
          amount: pat.amount,
          percent: pat.percent,
          color: pat.color,
          topPatients: []
        };
      }
      acc[key].topPatients.push({
        name: pat.name,
        age: pat.age,
        spend: pat.spend,
        category: pat.spend_category,
        costDrivers: pat.cost_drivers
      });
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Error fetching top patients:', error);
    res.status(500).json({ error: 'Failed to fetch top patients' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
