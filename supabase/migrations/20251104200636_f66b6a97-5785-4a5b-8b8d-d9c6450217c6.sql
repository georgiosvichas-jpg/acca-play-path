-- Insert ACCA papers data

-- Applied Knowledge Level
INSERT INTO papers (paper_code, title, level) VALUES
('BT', 'Business and Technology', 'Applied Knowledge'),
('MA', 'Management Accounting', 'Applied Knowledge'),
('FA', 'Financial Accounting', 'Applied Knowledge');

-- Applied Skills Level
INSERT INTO papers (paper_code, title, level) VALUES
('LW', 'Corporate and Business Law', 'Applied Skills'),
('PM', 'Performance Management', 'Applied Skills'),
('TX', 'Taxation', 'Applied Skills'),
('FR', 'Financial Reporting', 'Applied Skills'),
('AA', 'Audit and Assurance', 'Applied Skills'),
('FM', 'Financial Management', 'Applied Skills');

-- Strategic Professional Level (Essentials)
INSERT INTO papers (paper_code, title, level) VALUES
('SBL', 'Strategic Business Leader', 'Strategic Professional'),
('SBR', 'Strategic Business Reporting', 'Strategic Professional');

-- Strategic Professional Level (Options)
INSERT INTO papers (paper_code, title, level) VALUES
('AAA', 'Advanced Audit and Assurance', 'Strategic Professional'),
('APM', 'Advanced Performance Management', 'Strategic Professional'),
('ATX', 'Advanced Taxation', 'Strategic Professional'),
('AFM', 'Advanced Financial Management', 'Strategic Professional');