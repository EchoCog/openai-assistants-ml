import os
import json
import optuna
import numpy as np
from reservoirpy.nodes import ESN
from train_reservoir import load_training_data, train_model

def create_model(trial):
    """Create a model with parameters suggested by Optuna."""
    return ESN(
        units=trial.suggest_int('reservoir_dim', 50, 200),
        lr=trial.suggest_float('learning_rate', 1e-4, 1e-1, log=True),
        sr=trial.suggest_float('spectral_radius', 0.1, 1.5),
        input_scaling=trial.suggest_float('input_scaling', 0.1, 2.0),
        leak_rate=trial.suggest_float('leak_rate', 0.1, 0.9)
    )

def objective(trial):
    """Optimization objective function."""
    # Create model with trial parameters
    model = create_model(trial)
    
    # Load data
    X, y = load_training_data()
    
    try:
        # Train and evaluate
        _, metrics = train_model(model, X, y)
        return metrics['val_error']
    except Exception as e:
        print(f"Trial failed: {e}")
        return float('inf')

def optimize_hyperparameters(n_trials=100):
    """Run hyperparameter optimization."""
    study = optuna.create_study(
        study_name="deep_tree_echo_optimization",
        direction="minimize",
        storage=os.getenv('OPTUNA_STORAGE', 'sqlite:///optuna.db'),
        load_if_exists=True
    )
    
    study.optimize(objective, n_trials=n_trials)
    return study

def save_optimization_results(study, path):
    """Save optimization results."""
    os.makedirs(path, exist_ok=True)
    
    # Save best parameters
    best_params = study.best_params
    best_value = study.best_value
    
    results = {
        'best_params': best_params,
        'best_value': float(best_value),
        'optimization_history': [
            {
                'trial': t.number,
                'value': float(t.value),
                'params': t.params
            }
            for t in study.trials
        ]
    }
    
    with open(os.path.join(path, 'optimization_results.json'), 'w') as f:
        json.dump(results, f, indent=2)
    
    return best_params

def update_config(best_params, config_path):
    """Update model configuration with best parameters."""
    config = {
        'reservoir_dim': best_params['reservoir_dim'],
        'learning_rate': best_params['learning_rate'],
        'spectral_radius': best_params['spectral_radius'],
        'input_scaling': best_params['input_scaling'],
        'leak_rate': best_params['leak_rate']
    }
    
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)

def main():
    # Run optimization
    study = optimize_hyperparameters()
    
    # Save results
    artifacts_path = os.getenv('MODEL_ARTIFACTS_PATH', './models')
    best_params = save_optimization_results(study, artifacts_path)
    
    # Update configuration
    config_path = os.getenv('MODEL_CONFIG_PATH', './app/deep-tree-echo/config.json')
    update_config(best_params, config_path)
    
    print(f"Optimization completed. Best parameters: {best_params}")
    print(f"Best validation error: {study.best_value}")

if __name__ == '__main__':
    main() 