package model

type Profile struct {
	UserId    string  `json:"userId"`
	Name      string  `json:"name"`
	Surname   string  `json:"surname"`
	Biography string  `json:"biography"`
	Moto      string  `json:"moto"`
	PhotoId   string  `json:"imageURL"`
	Money     float64 `json:"money"`
}
