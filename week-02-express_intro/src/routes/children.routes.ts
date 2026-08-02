import { Router } from 'express';
import * as store from '../store.js';
import type { CreateChildDto, UpdateChildDto } from '../types.js';

export const childrenRouter = Router();

// GET /children — Listar todos los niños
// Status: 200
childrenRouter.get('/', (_req, res) => {
  res.status(200).json(store.getAll());
});

// GET /children/:id — Obtener un niño por ID
// Status: 200 si existe | 404 si no existe
childrenRouter.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const child = store.getById(id);

  if (!child) {
    res.status(404).json({ error: `Child with id ${id} not found` });
    return;
  }

  res.status(200).json(child);
});

// POST /children — Crear un nuevo niño
// Status: 201 con el recurso creado
childrenRouter.post('/', (req, res) => {
  const dto = req.body as CreateChildDto;
  const newChild = store.create(dto);
  res.status(201).json(newChild);
});

// PUT /children/:id — Actualizar un niño existente
// Status: 200 con el recurso actualizado | 404 si no existe
childrenRouter.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const dto = req.body as UpdateChildDto;
  const updatedChild = store.update(id, dto);

  if (!updatedChild) {
    res.status(404).json({ error: `Child with id ${id} not found` });
    return;
  }

  res.status(200).json(updatedChild);
});

// DELETE /children/:id — Eliminar un niño
// Status: 204 sin body | 404 si no existe
childrenRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const wasDeleted = store.remove(id);

  if (!wasDeleted) {
    res.status(404).json({ error: `Child with id ${id} not found` });
    return;
  }

  res.status(204).send();
});
